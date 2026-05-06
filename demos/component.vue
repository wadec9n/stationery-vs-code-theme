<!--
  Comment composer component.
  Showcases Vue 3 single-file components: <script setup lang="ts">,
  reactive refs and computed values, props/emits with type-only declarations,
  slots, v-bind/v-on shorthands, v-if/v-for, and <style scoped>.
-->

<script setup lang="ts">
import { computed, ref, watch } from "vue";

type Visibility = "public" | "team" | "private";

interface Author {
  id: string;
  name: string;
  avatar?: string;
}

interface Props {
  author: Author;
  placeholder?: string;
  maxLength?: number;
  initialVisibility?: Visibility;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Add a comment…",
  maxLength: 280,
  initialVisibility: "team",
});

const emit = defineEmits<{
  (event: "submit", payload: { body: string; visibility: Visibility }): void;
  (event: "cancel"): void;
}>();

const body = ref("");
const visibility = ref<Visibility>(props.initialVisibility);
const isFocused = ref(false);

const remaining = computed(() => props.maxLength - body.value.length);
const canSubmit = computed(() => body.value.trim().length > 0 && remaining.value >= 0);

watch(visibility, (next, prev) => {
  console.debug(`visibility: ${prev} → ${next}`);
});

function submit() {
  if (!canSubmit.value) return;
  emit("submit", { body: body.value.trim(), visibility: visibility.value });
  body.value = "";
}
</script>

<template>
  <form
    class="composer"
    :class="{ 'is-focused': isFocused, 'is-empty': !body }"
    :data-visibility="visibility"
    @submit.prevent="submit"
  >
    <header class="composer__header">
      <img
        v-if="author.avatar"
        :src="author.avatar"
        :alt="`${author.name}'s avatar`"
        width="32"
        height="32"
      />
      <strong>{{ author.name }}</strong>
      <span class="composer__hint" aria-hidden="true">
        — posting as <em>{{ visibility }}</em>
      </span>
    </header>

    <label class="visually-hidden" for="composer-body">Comment</label>
    <textarea
      id="composer-body"
      v-model.trim="body"
      :placeholder="placeholder"
      :maxlength="maxLength"
      rows="3"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <footer class="composer__footer">
      <fieldset>
        <legend class="visually-hidden">Visibility</legend>
        <label v-for="opt in (['public', 'team', 'private'] as const)" :key="opt">
          <input type="radio" :value="opt" v-model="visibility" />
          {{ opt }}
        </label>
      </fieldset>

      <span
        class="composer__count"
        :class="{ 'is-over': remaining < 0 }"
      >
        {{ remaining }} left
      </span>

      <slot name="actions" :submit="submit" :reset="() => (body = '')">
        <button type="button" @click="emit('cancel')">Cancel</button>
        <button type="submit" :disabled="!canSubmit">Post</button>
      </slot>
    </footer>
  </form>
</template>

<style scoped lang="scss">
.composer {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border, #d8cfbf);
  border-radius: 0.5rem;
  background: var(--paper, #fdfaf3);

  &.is-focused {
    border-color: var(--accent, #3b6ea0);
    box-shadow: 0 0 0 3px color-mix(in oklch, currentColor 12%, transparent);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    img { border-radius: 50%; }
  }

  &__hint { color: oklch(45% 0 0); font-size: 0.875rem; }

  &__footer {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    fieldset { border: 0; padding: 0; display: flex; gap: 0.5rem; }

    .composer__count.is-over { color: var(--danger, #b04a3a); font-weight: 600; }
  }
}
</style>
