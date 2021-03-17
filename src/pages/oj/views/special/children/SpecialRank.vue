<template>
  <div>
    <component :is="currentView"></component>
  </div>
</template>

<script>

import Rank from './Rank'

const NullComponent = {
  name: 'null-component',
  template: '<div></div>'
}

export default {
  name: 'special-rank',
  components: {
    Rank,
    NullComponent
  },
  computed: {
    currentView () {
      return 'Rank'
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit('change_special_item_visible', {menu: true})
    next()
  }
}
</script>
<style lang="less" scoped>
</style>

