<template>
  <div v-if="!['textarea', 'select', 'search'].includes(type)" class="_wrapper">
    <label v-if="label" :for="clickableLabelId" class="_label">{{ label }}</label>
    <input
      :id="clickableLabelId"
      class="_input"
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
        | 'search'
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
._input
  position: relative
  padding-top: 0.5rem
  padding-bottom: 0.5rem
  padding-left: 1rem
  padding-right: 1rem
  background-color: transparent
  font-size: 0.875rem
  line-height: 1.25rem
  line-height: 1.25
  width: 100%
  border-radius: 0.125rem
  border-width: 1px
  appearance: none
</style>
