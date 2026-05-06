// LRU cache template.
// Showcases preprocessor directives, namespaces, templates,
// concepts, lambdas, smart pointers, RAII, and ranged-for.

#include <chrono>
#include <concepts>
#include <iostream>
#include <list>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>
#include <unordered_map>

#define STATIONERY_VERSION "0.4.2"

#if __cplusplus < 202002L
#  error "This file requires C++20 or newer."
#endif

namespace stationery {

template <typename K>
concept Hashable = requires(const K& key) {
    { std::hash<K>{}(key) } -> std::convertible_to<std::size_t>;
};

template <Hashable K, typename V>
class LruCache {
public:
    using Pair = std::pair<K, V>;

    explicit LruCache(std::size_t capacity)
        : capacity_{capacity > 0 ? capacity : 1} {}

    LruCache(const LruCache&)            = delete;
    LruCache& operator=(const LruCache&) = delete;
    LruCache(LruCache&&) noexcept        = default;
    LruCache& operator=(LruCache&&) noexcept = default;

    [[nodiscard]] std::size_t size() const noexcept { return order_.size(); }
    [[nodiscard]] bool        empty() const noexcept { return order_.empty(); }

    void put(const K& key, V value) {
        if (auto it = index_.find(key); it != index_.end()) {
            it->second->second = std::move(value);
            order_.splice(order_.begin(), order_, it->second);
            return;
        }
        if (order_.size() == capacity_) evict();
        order_.emplace_front(key, std::move(value));
        index_[key] = order_.begin();
    }

    [[nodiscard]] std::optional<V> get(const K& key) {
        auto it = index_.find(key);
        if (it == index_.end()) return std::nullopt;
        order_.splice(order_.begin(), order_, it->second);
        return it->second->second;
    }

    template <typename Fn>
    void for_each(Fn&& fn) const {
        for (const auto& [k, v] : order_) fn(k, v);
    }

private:
    void evict() {
        const auto& [k, _] = order_.back();
        index_.erase(k);
        order_.pop_back();
    }

    std::size_t                                                          capacity_;
    std::list<Pair>                                                      order_;
    std::unordered_map<K, typename std::list<Pair>::iterator>            index_;
};

template <typename T>
struct Timer {
    using Clock = std::chrono::steady_clock;
    Clock::time_point start{Clock::now()};

    ~Timer() {
        const auto elapsed = std::chrono::duration_cast<std::chrono::microseconds>(
            Clock::now() - start);
        std::cout << "[timer] " << elapsed.count() << "μs\n";
    }
};

}  // namespace stationery

int main() try {
    using namespace stationery;

    auto cache = std::make_unique<LruCache<std::string, int>>(3);
    Timer<void> _;

    for (const auto& [key, value] : {
             std::pair{std::string{"alpha"}, 1},
             std::pair{std::string{"beta"},  2},
             std::pair{std::string{"gamma"}, 3},
             std::pair{std::string{"delta"}, 4},  // evicts "alpha"
         }) {
        cache->put(key, value);
    }

    if (auto v = cache->get("beta"); v.has_value()) {
        std::cout << "beta = " << *v << '\n';
    }

    cache->for_each([](const auto& k, const auto& v) {
        std::cout << "  " << k << " -> " << v << '\n';
    });

    return EXIT_SUCCESS;
} catch (const std::exception& ex) {
    std::cerr << "fatal: " << ex.what() << '\n';
    return EXIT_FAILURE;
}
