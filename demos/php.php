<?php

declare(strict_types=1);

namespace App\Billing;

use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Subscription billing engine.
 *
 * Demonstrates namespaces, attributes, enums, readonly classes,
 * match expressions, and named arguments.
 */

#[\Attribute(\Attribute::TARGET_METHOD)]
final class Audited
{
    public function __construct(public readonly string $action) {}
}

enum Plan: string
{
    case Free = 'free';
    case Pro = 'pro';
    case Enterprise = 'enterprise';

    public function monthlyCents(): int
    {
        return match ($this) {
            Plan::Free       => 0,
            Plan::Pro        => 1_900,
            Plan::Enterprise => 49_900,
        };
    }
}

readonly class Customer
{
    public function __construct(
        public string $id,
        public string $email,
        public Plan $plan = Plan::Free,
    ) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Bad email: {$email}");
        }
    }
}

trait LogsEvents
{
    /** @var list<string> */
    private array $events = [];

    protected function record(string $event): void
    {
        $this->events[] = sprintf('[%s] %s', (new DateTimeImmutable())->format('c'), $event);
    }

    public function eventLog(): array
    {
        return $this->events;
    }
}

final class BillingEngine
{
    use LogsEvents;

    /** @param array<string, Customer> $customers */
    public function __construct(private array $customers = []) {}

    #[Audited(action: 'charge')]
    public function chargeAll(DateTimeImmutable $on): int
    {
        $total = 0;
        foreach ($this->customers as $customer) {
            $cents = $customer->plan->monthlyCents();
            if ($cents === 0) continue;

            $total += $cents;
            $this->record("Charged {$customer->email} {$cents}¢ on {$on->format('Y-m-d')}");
        }
        return $total;
    }

    public static function fromArray(array $rows): self
    {
        $map = [];
        foreach ($rows as ['id' => $id, 'email' => $email, 'plan' => $plan]) {
            $map[$id] = new Customer(
                id: $id,
                email: $email,
                plan: Plan::from($plan),
            );
        }
        return new self($map);
    }
}

$engine = BillingEngine::fromArray([
    ['id' => 'c_01', 'email' => 'local-part@example.com', 'plan' => 'pro'],
    ['id' => 'c_02', 'email' => 'local-part@example.com', 'plan' => 'enterprise'],
]);

$revenue = $engine->chargeAll(new DateTimeImmutable('2026-05-01'));
printf("Revenue: \$%.2f\n", $revenue / 100);

foreach ($engine->eventLog() as $line) {
    echo $line, PHP_EOL;
}
