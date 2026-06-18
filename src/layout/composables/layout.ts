import { computed, reactive, type Ref } from 'vue'

const layoutConfig = reactive<{
  preset: string
  primary: string
  surface: string | null
  darkTheme: boolean
  menuMode: string
}>({
  preset: 'Aura',
  primary: 'emerald',
  surface: null,
  darkTheme: false,
  menuMode: 'static',
})

const layoutState = reactive<{
  staticMenuDesktopInactive: boolean
  overlayMenuActive: boolean
  profileSidebarVisible: boolean
  configSidebarVisible: boolean
  staticMenuMobileActive: boolean
  menuHoverActive: boolean
  activeMenuItem: string | null
  pageLoading: boolean
}>({
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  activeMenuItem: null,
  pageLoading: false,
})

export function useLayout() {
  const setActiveMenuItem = (item: string | Ref<string | null> | null) => {
    if (!item) {
      layoutState.activeMenuItem = null
      return
    }

    if (typeof item === 'string') {
      layoutState.activeMenuItem = item || null
    } else {
      layoutState.activeMenuItem = item.value || null
    }
  }

  const setPageLoading = (loading: boolean) => {
    layoutState.pageLoading = loading
  }

  const toggleDarkMode = () => {
    if (!document.startViewTransition) {
      executeDarkModeToggle()

      return
    }

    document.startViewTransition(() => executeDarkModeToggle())
  }

  const executeDarkModeToggle = () => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme
    document.documentElement.classList.toggle('app-dark')
  }

  const toggleMenu = () => {
    if (layoutConfig.menuMode === 'overlay') {
      layoutState.overlayMenuActive = !layoutState.overlayMenuActive
    }

    if (window.innerWidth > 991) {
      layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive
    } else {
      layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive
    }
  }

  const isSidebarActive = computed(
    () => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive,
  )

  const isDarkTheme = computed(() => layoutConfig.darkTheme)

  const getPrimary = computed(() => layoutConfig.primary)

  const getSurface = computed(() => layoutConfig.surface)

  const isPageLoading = computed(() => layoutState.pageLoading)

  return {
    layoutConfig,
    layoutState,
    toggleMenu,
    isSidebarActive,
    isDarkTheme,
    getPrimary,
    getSurface,
    isPageLoading,
    setActiveMenuItem,
    setPageLoading,
    toggleDarkMode,
    executeDarkModeToggle,
  }
}
