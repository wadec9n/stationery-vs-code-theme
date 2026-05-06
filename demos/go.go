// Package pool provides a small, bounded worker pool with context cancellation.
// Showcases interfaces, generics, goroutines, channels, and struct tags.
package pool

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"
)

// Job represents a unit of work that returns a typed result.
type Job[T any] interface {
	Run(ctx context.Context) (T, error)
}

// Result wraps a job outcome with timing metadata.
type Result[T any] struct {
	Value    T             `json:"value"`
	Err      error         `json:"error,omitempty"`
	Duration time.Duration `json:"duration_ns"`
}

// Pool dispatches jobs across a fixed number of workers.
type Pool[T any] struct {
	workers int
	jobs    chan Job[T]
	results chan Result[T]
	once    sync.Once
}

func New[T any](workers int) *Pool[T] {
	if workers < 1 {
		workers = 1
	}
	return &Pool[T]{
		workers: workers,
		jobs:    make(chan Job[T], workers*2),
		results: make(chan Result[T], workers*2),
	}
}

// Start launches the worker goroutines. Calling Start more than once is a no-op.
func (p *Pool[T]) Start(ctx context.Context) {
	p.once.Do(func() {
		var wg sync.WaitGroup
		for i := 0; i < p.workers; i++ {
			wg.Add(1)
			go func(id int) {
				defer wg.Done()
				for job := range p.jobs {
					started := time.Now()
					value, err := job.Run(ctx)
					p.results <- Result[T]{
						Value:    value,
						Err:      err,
						Duration: time.Since(started),
					}
				}
			}(i)
		}
		go func() { wg.Wait(); close(p.results) }()
	})
}

func (p *Pool[T]) Submit(job Job[T]) error {
	select {
	case p.jobs <- job:
		return nil
	default:
		return errors.New("pool: queue full")
	}
}

func (p *Pool[T]) Close()                          { close(p.jobs) }
func (p *Pool[T]) Results() <-chan Result[T]       { return p.results }

// httpJob is an example Job implementation.
type httpJob struct {
	URL string `json:"url"`
}

func (j httpJob) Run(ctx context.Context) (int, error) {
	select {
	case <-ctx.Done():
		return 0, ctx.Err()
	case <-time.After(25 * time.Millisecond):
		return 200, nil
	}
}

func Example() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	p := New[int](4)
	p.Start(ctx)

	urls := []string{"/", "/about", "/contact", "/pricing"}
	for _, u := range urls {
		if err := p.Submit(httpJob{URL: u}); err != nil {
			fmt.Println("submit:", err)
		}
	}
	p.Close()

	for r := range p.Results() {
		out, _ := json.Marshal(r)
		fmt.Printf("status=%d in %v %s\n", r.Value, r.Duration, out)
	}
}
