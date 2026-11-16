import type { App, Directive } from 'vue'

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const thousandSeparator: Directive<HTMLElement, number> = {
  mounted(el, binding) {
    el.textContent = typeof binding.value === 'number' ? formatNumber(binding.value) : String(binding.value)
  },
  updated(el, binding) {
    el.textContent = typeof binding.value === 'number' ? formatNumber(binding.value) : String(binding.value)
  },
}

const numberFormat: Directive = {
  mounted(el) {
    const value = el.textContent?.toString() ?? ''
    const number = Number.parseFloat(value)
    if (!Number.isFinite(number))
      return

    const digits = !value.includes('.') ? 0 : value.length - value.indexOf('.') - 1
    el.textContent = number.toLocaleString(undefined, { minimumFractionDigits: digits })
  },
}

export function installDirectives(app: App): void {
  app.directive('number-format', numberFormat)
  app.directive('thousand-separator', thousandSeparator)
}
