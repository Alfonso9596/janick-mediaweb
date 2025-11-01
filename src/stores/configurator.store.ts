import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export enum CONFIGURATOR_KEYS {
  CONFIGURATOR_PRESET = 'CONFIGURATOR_PRESET',
  CONFIGURATOR_PRIMARY = 'CONFIGURATOR_PRIMARY',
  CONFIGURATOR_SURFACE = 'CONFIGURATOR_SURFACE',
  CONFIGURATOR_DARKTHEME = 'CONFIGURATOR_DARKTHEME',
  CONFIGURATOR_MENUMODE = 'CONFIGURATOR_MENUMODE',
}

export const useConfiguratorStore = defineStore('configurator', () => {
  const configuratorPreset: Ref<string> = ref(
    String(localStorage.getItem(CONFIGURATOR_KEYS.CONFIGURATOR_PRESET) ?? 'Aura'),
  )

  function setConfiguratorPreset(preset: string): void {
    localStorage.setItem(CONFIGURATOR_KEYS.CONFIGURATOR_PRESET, preset)
  }

  const configuratorPrimary: Ref<string> = ref(
    String(localStorage.getItem(CONFIGURATOR_KEYS.CONFIGURATOR_PRIMARY) ?? 'emerald'),
  )

  function setConfiguratorPrimary(primary: string): void {
    localStorage.setItem(CONFIGURATOR_KEYS.CONFIGURATOR_PRIMARY, primary)
  }

  const configuratorSurface: Ref<string> = ref(
    String(localStorage.getItem(CONFIGURATOR_KEYS.CONFIGURATOR_SURFACE) ?? 'slate'),
  )

  function setConfiguratorSurface(surface: string): void {
    localStorage.setItem(CONFIGURATOR_KEYS.CONFIGURATOR_SURFACE, surface)
  }

  const configuratorDarktheme: Ref<boolean> = ref(
    Boolean(localStorage.getItem(CONFIGURATOR_KEYS.CONFIGURATOR_DARKTHEME) ?? true),
  )

  function setConfiguratorDarkTheme(darktheme: boolean): void {
    localStorage.setItem(CONFIGURATOR_KEYS.CONFIGURATOR_DARKTHEME, String(darktheme))
  }

  const configuratorMenumode: Ref<string> = ref(
    String(localStorage.getItem(CONFIGURATOR_KEYS.CONFIGURATOR_MENUMODE) ?? 'static'),
  )

  function setConfiguratorMenumode(menumode: string): void {
    localStorage.setItem(CONFIGURATOR_KEYS.CONFIGURATOR_MENUMODE, menumode)
  }

  return {
    configuratorPreset,
    setConfiguratorPreset,
    configuratorPrimary,
    setConfiguratorPrimary,
    configuratorSurface,
    setConfiguratorSurface,
    configuratorDarktheme,
    setConfiguratorDarkTheme,
    configuratorMenumode,
    setConfiguratorMenumode,
  }
})
