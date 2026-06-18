<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout'
import { onBeforeMount, ref, watch, type PropType } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface MenuItem {
  label?: string
  icon?: string
  vicon?: string
  class?: string
  target?: string
  url?: string
  to?: string
  visible?: boolean
  disabled?: boolean
  items?: MenuItem[]
  key?: string
  command?: (event: { originalEvent: MouseEvent; item: MenuItem }) => void
}

const { layoutState, setActiveMenuItem, toggleMenu } = useLayout()

const props = defineProps({
  item: {
    type: Object as PropType<MenuItem>,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  root: {
    type: Boolean,
    default: true,
  },
  parentItemKey: {
    type: String,
    default: null,
  },
})

const isActiveMenu = ref(false)
const itemKey = ref<string | null>(null)

onBeforeMount(() => {
  itemKey.value = props.parentItemKey
    ? props.parentItemKey + '-' + props.index
    : String(props.index)

  const activeItem = layoutState.activeMenuItem as string | null

  isActiveMenu.value =
    activeItem === itemKey.value || (activeItem ? activeItem.startsWith(itemKey.value + '-') : false)
})

watch(
  () => layoutState.activeMenuItem,
  (newVal: string | null) => {
    isActiveMenu.value =
      newVal === itemKey.value || (newVal ? newVal.startsWith(itemKey.value + '-') : false)
  },
)

function itemClick(event: MouseEvent, item: MenuItem) {
  if (item.disabled) {
    event.preventDefault()
    return
  }

  if (
    (item.to || item.url) &&
    (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)
  ) {
    toggleMenu()
  }

  if (item.command) {
    item.command({ originalEvent: event, item: item })
  }

  let foundItemKey

  if (item.items) {
    foundItemKey = isActiveMenu.value ? props.parentItemKey : itemKey
  } else {
    foundItemKey = itemKey.value
  }

  setActiveMenuItem(foundItemKey)
}

function checkActiveRoute(item: MenuItem) {
  return route.path === item.to
}
</script>

<template>
  <ul class="layout-menu">
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
      <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">
        {{ item.label }}
      </div>
      <a
        v-if="(!item.to || item.items) && item.visible !== false"
        :href="item.url"
        @click="itemClick($event, item)"
        :class="item.class"
        :target="item.target"
        tabindex="0"
      >
        <v-icon v-if="item.vicon" :name="item.vicon" class="mr-2" />
        <i v-else :class="item.icon" class="layout-menuitem-icon"></i>
        <span class="layout-menuitem-text">{{ item.label }}</span>
        <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
      </a>
      <router-link
        v-if="item.to && !item.items && item.visible !== false"
        @click="itemClick($event, item)"
        :class="[item.class, { 'active-route': checkActiveRoute(item) }]"
        tabindex="0"
        :to="item.to"
      >
        <v-icon v-if="item.vicon" :name="item.vicon" class="mr-2" />
        <i v-else :class="item.icon" class="layout-menuitem-icon"></i>
        <span class="layout-menuitem-text">{{ item.label }}</span>
        <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
      </router-link>
      <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
        <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
          <AppMenuItem
            v-for="(child, i) in item.items"
            :key="child.key"
            :index="i"
            :item="child"
            :parent-item-key="itemKey"
            :root="false"
          ></AppMenuItem>
        </ul>
      </Transition>
    </li>
  </ul>
</template>
