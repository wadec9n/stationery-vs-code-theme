// Library catalog with borrowing rules.
// Showcases sealed types, records, pattern matching,
// streams, generics, and annotations.

package com.example.library;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public final class Catalog {

    /** Discriminated union of media types available for loan. */
    public sealed interface Media permits Book, Audiobook, Periodical {
        String title();
        Duration loanPeriod();
    }

    public record Book(String title, String author, int pages) implements Media {
        public Book {
            Objects.requireNonNull(title, "title");
            if (pages <= 0) throw new IllegalArgumentException("pages must be positive");
        }
        @Override public Duration loanPeriod() { return Duration.ofDays(21); }
    }

    public record Audiobook(String title, String narrator, Duration runtime) implements Media {
        @Override public Duration loanPeriod() { return Duration.ofDays(14); }
    }

    public record Periodical(String title, int issue, LocalDate published) implements Media {
        @Override public Duration loanPeriod() { return Duration.ofDays(7); }
    }

    @FunctionalInterface
    interface OverdueListener {
        void onOverdue(Loan loan);
    }

    public record Loan(Media item, String borrower, LocalDate due) {
        public boolean overdueOn(LocalDate date) {
            return date.isAfter(due);
        }
    }

    private final List<Media> shelf = new ArrayList<>();
    private final List<Loan> loans = new ArrayList<>();
    private final List<OverdueListener> listeners = new ArrayList<>();

    public Catalog stock(Media... items) {
        Collections.addAll(shelf, items);
        return this;
    }

    public Optional<Loan> borrow(String title, String borrower, LocalDate today) {
        return shelf.stream()
                .filter(m -> m.title().equalsIgnoreCase(title))
                .findFirst()
                .map(item -> {
                    var loan = new Loan(item, borrower, today.plus(item.loanPeriod()));
                    loans.add(loan);
                    return loan;
                });
    }

    public Map<String, Long> countByType() {
        return shelf.stream().collect(Collectors.groupingBy(
                m -> switch (m) {
                    case Book b           -> "books";
                    case Audiobook a      -> "audiobooks";
                    case Periodical p     -> "periodicals";
                },
                Collectors.counting()));
    }

    public List<Loan> findOverdue(LocalDate on) {
        Predicate<Loan> isOverdue = l -> l.overdueOn(on);
        var result = loans.stream().filter(isOverdue).toList();
        result.forEach(l -> listeners.forEach(x -> x.onOverdue(l)));
        return result;
    }

    public static void main(String[] args) {
        var catalog = new Catalog().stock(
                new Book("A Wizard of Earthsea", "Le Guin", 240),
                new Audiobook("Dune", "Brick", Duration.ofHours(21)),
                new Periodical("Nature", 7321, LocalDate.of(2026, 4, 30)));

        catalog.borrow("Dune", "local-part@example.com", LocalDate.of(2026, 4, 1));
        var overdue = catalog.findOverdue(LocalDate.of(2026, 5, 5));
        System.out.printf("counts=%s, overdue=%d%n", catalog.countByType(), overdue.size());
    }
}
