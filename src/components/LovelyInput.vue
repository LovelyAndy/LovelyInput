<template>
  <div v-if="!['textarea', 'select', 'search'].includes(type)" class="_wrapper">
    <label v-if="label" :for="clickableLabelId" class="_label">{{ label }}</label>
    <input
      :id="clickableLabelId"
      class="_base-input"
      ref="inputRef"
      data-cy="input-field"
      v-model="valueInner"
      :disabled="disabled || undefined"
      :type="type"
      :placeholder="placeholder"
      :readonly="readonly || undefined"
      :required="required || undefined"
      :autofocus="autofocus"
      @focus="isFocused = true"
      @blur="() => onBlur()"
    />
  </div>
  <div v-if="type === 'search'" class="_wrapper">
    <div class="flex flex-col relative">
      <!-- @focus="suggestionsVisible = true" -->
      <input
        :id="clickableLabelId"
        class="_search-input"
        ref="inputRef"
        data-cy="input-field"
        v-model="valueInner"
        :disabled="disabled || undefined"
        :type="type"
        :placeholder="placeholder"
        :readonly="readonly || undefined"
        :required="required || undefined"
        :autofocus="autofocus"
        @focus="isFocused = true"
        @blur="() => onBlur()"
      />
    </div>
  </div>
  <div v-if="type === 'textarea'" class="flex flex-col">
    <label v-if="label" :for="clickableLabelId" class="font-normal w-max text-primary-blue"
      >{{ label }}:</label
    >
    <textarea
      :id="clickableLabelId"
      class="overflow-y resize-none min-w-12 border border-slider bg-transparent rounded-sm text-primary-blue text-sm py-2 px-4 leading-tight placeholder-not-active-button-text"
      ref="inputRef"
      data-cy="textarea-field"
      v-model="valueInner"
      :style="`${
        rows === '1' ? 'resize: none' : ''
      }; height: ${textareaHeight}; min-height: 3.5rem; max-height: ${autogrowMaxHeight}rem`"
      :rows="rows"
      :disabled="disabled || undefined"
      :type="type"
      :placeholder="placeholder"
      :readonly="readonly || undefined"
      :required="required || undefined"
      :autofocus="autofocus"
      :autogrow="autogrow"
      @focus="isFocused = true"
      @blur="() => onBlur()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, watch, PropType } from 'vue'

export default defineComponent({
  name: 'LovelyInput',
  props: {
    label: {
      type: String,
    },
    /** HTML5 attribute */
    disabled: { type: Boolean, default: false },
    /**
     * HTML5 attributes — with EXCEPTIONS!
     * - Exception: can also be 'textarea' in which case a `<textarea />` is rendered
     * - Exception: can also be 'select' in which case a `<select />` is rendered
     * @type {'text' | 'textarea' | 'select' | 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'time' | 'url' | 'week'}
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
     */
    type: {
      type: String as PropType<
        | 'text'
        | 'textarea'
        | 'select'
        | 'button'
        | 'inputNotAvailable'
        | 'checkbox'
        | 'color'
        | 'date'
        | 'datetime-local'
        | 'email'
        | 'file'
        | 'hidden'
        | 'image'
        | 'month'
        | 'number'
        | 'password'
        | 'radio'
        | 'range'
        | 'reset'
        | 'search'
        | 'submit'
        | 'tel'
        | 'time'
        | 'url'
        | 'week'
      >,
      default: 'text',
    },

    /** only when `type` 'select' && want an icon */
    icon: { type: Boolean, default: false },
    kind: { type: String as PropType<'form' | 'main'>, default: 'form' },
    /** only when `type` 'select' */
    options: {
      type: Array as PropType<string[] | { label: string; value: string | number }[]>,
      default: undefined,
    },
    disabledOption: {
      type: String,
      required: false,
    },
    /** HTML5 attribute */
    placeholder: { type: String },
    /** HTML5 attribute */
    readonly: { type: Boolean },
    /** HTML5 attribute */
    required: { type: Boolean },
    /** HTML5 attribute (only for textarea) */
    rows: { type: String },
    /** v-model */
    modelValue: { type: [String, Number], default: '' },
    autofocus: { type: Boolean, default: false },
    autogrow: { type: Boolean, default: false },
    autocomplete: { type: Boolean, default: false },
    suggestions: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    searchHistory: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    autogrowMaxHeight: { type: Number, default: 0 },
    debounce: { type: Number, default: undefined },
  },
  emits: ['update:modelValue', 'selectValue'],
  setup(props, { emit }) {
    let debounceInner = 0
    if (typeof props.debounce === 'number') {
      debounceInner = props.debounce
    } else if (props.type !== 'select') {
      debounceInner = 0
    }
    const inputRef = ref<HTMLElement | null>(null)

    const textareaHeight = ref<string | number | null>('unset')
    const valueInner = ref<any>(props.modelValue)
    const isFocused = ref(false)
    function onBlur() {
      setTimeout(() => (isFocused.value = false), 0)
      // without this function the blur event happens right away and you are not able to select an option,
      // because it hides the autocomplete on blur
      // this setTimeout slows the blur event to hide the autocomplete list
    }
    const focus = () => {
      inputRef.value?.focus()
    }
    if (props.autofocus === true) {
      onMounted(() => {
        // I don't know we need nexttick
        nextTick(() => {
          setTimeout(() => focus(), 500)
        })
      })
    }
    if (valueInner.value) {
      // only autogrow on mount when there's autogrow
      // otherwise it will not adhere to eg. `rows="3"` on empty textareas
      autogrowInput()
    }
    let timeout: any = null
    watch(valueInner, (newVal, oldVal) => {
      autogrowInput()
      const debounceMs = debounceInner
      if (debounceMs > 0) {
        clearTimeout(timeout)
        timeout = setTimeout(() => emitInput(newVal), debounceMs)
      } else {
        emitInput(newVal)
      }
    })
    watch(
      () => props.modelValue,
      (newVal) => (valueInner.value = newVal)
    )
    function emitInput(newVal: any) {
      let payload = newVal
      emit('update:modelValue', payload)
    }
    function autogrowInput() {
      const textareaRef = inputRef.value
      if (!!textareaRef && props.type === 'textarea' && props.autogrow) {
        textareaHeight.value = 'auto'
        if (valueInner) textareaHeight.value = `${textareaRef.scrollHeight}px`
        setTimeout(() => {
          textareaHeight.value = `${textareaRef.scrollHeight}px`
        }, 1)
      }
    }

    const clickableLabelId = Math.random().toString()

    return {
      inputRef,
      valueInner,
      textareaHeight,
      clickableLabelId,
      isFocused,
      focus,
      onBlur,
    }
  },
})
</script>

<style lang="sass" scoped>
._wrapper
  position: relative
._label
  font-weight: 400
  width: max-content
._base-input
  position: relative
  padding: 0.5rem 1rem
  background-color: transparent
  font-size: 0.875rem
  line-height: 1.25rem
  line-height: 1.25
  width: 100%
  border: 1px solid #333
  border-radius: 0.125rem
  appearance: none
  &:focus
    outline: none !important
    border-color: indianred
._search-input
  width: 100%
  padding: 0.5rem 0
  padding-right: .5rem
  padding-left: 1.75rem
  // padding: 9px 4px 9px 40px
  border: 1px solid #333
  border-radius: 0.125rem
  background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' class='bi bi-search' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'%3E%3C/path%3E%3C/svg%3E") no-repeat 8px center
  &:focus
    outline: none !important
    border-color: indianred
    // box-shadow: 0 0 10px #719ECE

[type="search"]::-webkit-search-cancel-button
  -webkit-appearance: none
  appearance: none
  height: 10px
  width: 10px
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjEyMy4wNXB4IiBoZWlnaHQ9IjEyMy4wNXB4IiB2aWV3Qm94PSIwIDAgMTIzLjA1IDEyMy4wNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTIzLjA1IDEyMy4wNTsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPHBhdGggZD0iTTEyMS4zMjUsMTAuOTI1bC04LjUtOC4zOTljLTIuMy0yLjMtNi4xLTIuMy04LjUsMGwtNDIuNCw0Mi4zOTlMMTguNzI2LDEuNzI2Yy0yLjMwMS0yLjMwMS02LjEwMS0yLjMwMS04LjUsMGwtOC41LDguNQ0KCQljLTIuMzAxLDIuMy0yLjMwMSw2LjEsMCw4LjVsNDMuMSw0My4xbC00Mi4zLDQyLjVjLTIuMywyLjMtMi4zLDYuMSwwLDguNWw4LjUsOC41YzIuMywyLjMsNi4xLDIuMyw4LjUsMGw0Mi4zOTktNDIuNGw0Mi40LDQyLjQNCgkJYzIuMywyLjMsNi4xLDIuMyw4LjUsMGw4LjUtOC41YzIuMy0yLjMsMi4zLTYuMSwwLTguNWwtNDIuNS00Mi40bDQyLjQtNDIuMzk5QzEyMy42MjUsMTcuMTI1LDEyMy42MjUsMTMuMzI1LDEyMS4zMjUsMTAuOTI1eiIvPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=)
  background-size: 10px 10px
</style>
