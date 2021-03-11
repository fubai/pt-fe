<template>
  <div>
    <div class="app-sidebar" v-if="menus">
      <el-menu @select="onClickMenu" background-color="#0E2533" text-color="#909399" active-text-color="#fff" ref="menu" class="app-sidebar-menu" v-if="menus">
        <template v-for="(menu, i) in menus">
          <el-menu-item :index="i + '__' + menu.address" :key="i" v-if="!menu.children || !menu.children.length">
            <i :class="menu.icon" v-if="menu.icon"></i>
            <span>{{menu.name}}</span>
          </el-menu-item>
          <el-submenu :index="i + '__' + menu.address" :key="i" v-else>
            <template slot="title">
              <i :class="menu.icon" v-if="menu.icon"></i>
              <span>{{menu.name}}</span>
            </template>
            <el-menu-item :index="i + '_' + j + '__' + child.address" v-for="(child, j) in menu.children" :key="i + '-' + j">
              <i :class="child.icon" v-if="child.icon"></i>
              <span>{{child.name}}</span>
            </el-menu-item>
          </el-submenu>
        </template>
      </el-menu>
    </div>
    <div :class="menus ? 'app-body' : 'app-body1'">
      <div class="app-tab">
        <div @click="onClickTab(tab)" v-for="(tab, i) in tabs" :key="i" :class="actived === tab.address ? 'app-tab-actived' : ''">{{tab.name}}<span class="el-icon-close" @click.stop.prevent="close(tab)" v-if="tab.closable !== false"></span></div>
      </div>
      <keep-alive>
        <router-view ref="view" :key="$route.fullPath"></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

function findMenu (menus, address) {
  if (!menus) {
    return
  }

  for (let menu of menus) {
    if (menu.address === address) {
      return menu
    }

    let result = findMenu(menu.children, address)
    if (result) {
      return result
    }
  }
}

export default {
  name: 'app-body',
  data () {
    return {
      tabs: [],
      actived: null
    }
  },
  computed: {
    menus () {
      return this.$store.state.admin.menus
    }
  },
  watch: {
    actived () {
      Vue.nextTick(() => {
        this.switchMenu()
      })
    }
  },
  created () {
    let address = location.href.split('#')[1]
    let menu = findMenu(this.menus, address)
    if (menu) {
      this.tabs.push(menu)
    }

    this.actived = address
  },
  methods: {
    onClickMenu (index) {
      let address = index.substring(index.indexOf('__') + 2)
      if (!address || address === this.actived) {
        return
      }
      this.open(findMenu(this.menus, address))
    },
    onClickTab (tab) {
      if (tab.address === this.actived) {
        return
      }
      this.open(tab)
    },
    open (current) {
      let me = this
      for (let tab of me.tabs) {
        if (tab.address === current.address) {
          me.actived = current.address
          me.$router.replace(current.address)
          return
        }
      }

      me.tabs.push(current)
      me.actived = current.address
      me.$router.replace({ path: current.address })
    },
    close (current) {
      let address = current.address
      let tabs = this.tabs
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].address === address) {
          tabs.splice(i, 1)

          if (this.actived === address) {
            if (tabs.length > i) {
              this.actived = tabs[i].address
              this.$router.replace(this.actived)
            } else if (tabs.length > 0) {
              this.actived = tabs[tabs.length - 1].address
              this.$router.replace(this.actived)
            } else {
              this.actived = null
            }
          }

          Vue.nextTick(() => {
            let matchedComponentName = this.$router.getMatchedComponents(address)[0].name
            let keepAlive = this.$refs.view.$options.parent
            for (let key in keepAlive.cache) {
              let componentInstance = keepAlive.cache[key].componentInstance
              let componentName = componentInstance.$options.name
              if (componentName === matchedComponentName) {
                componentInstance.$destroy()
                delete keepAlive.cache[key]

                for (let i = 0; i < keepAlive.keys.length; i++) {
                  if (key === keepAlive.keys[i]) {
                    keepAlive.keys.splice(i, 1)
                    break
                  }
                }
              }
            }
          })

          return
        }
      }
    },
    switchMenu () {
      if (!this.menus) {
        return
      }

      let index
      for (let i = 0; i < this.menus.length; i++) {
        let menu = this.menus[i]
        if (menu.address === this.actived) {
          index = i + '__' + this.actived
          break
        }

        let submenus = menu.children || []
        for (let j = 0; j < submenus.length; j++) {
          if (submenus[j].address === this.actived) {
            index = i + '_' + j + '__' + this.actived
            break
          }
        }
      }

      let menuCmp = this.$refs.menu
      let item = menuCmp.items[index]
      let submenu = menuCmp.submenus[index]
      if (item) {
        if (item.parentMenu && item.parentMenu !== menuCmp && !item.parentMenu.opened) {
          menuCmp.handleSubmenuClick(item.parentMenu)
        }
        menuCmp.handleItemClick(item)
      } else if (submenu) {
        if (!submenu.opened) {
          menuCmp.handleSubmenuClick(submenu)
        }
      }
    }
  }
}
</script>

<style>
.app-sidebar{width:240px;height:calc(100vh - 50px);background-color:#0E2533;float:left;overflow:auto;}
.app-sidebar-menu{border-right:0 !important;}
.app-body{height:calc(100vh - 50px);width:calc(100% - 240px);float:right;}
.app-body1{height:calc(100vh - 50px);}

.app-tab{height:40px;border-bottom:1px solid #e4e7ed;box-sizing:border-box;font-size:12px;font-weight:500;color:#303133;margin-top:12px;}
.app-tab>div{float:left;height:38px;line-height:38px;border:1px solid #e4e7ed;border-bottom:0;padding:0 22px 0 14px;position:relative;cursor:pointer;margin-left:12px;border-radius:6px 6px 0 0;box-shadow:0 -1px 3px rgba(0, 0, 0, 0.1);user-select:none;}
.app-tab>div>span{margin-left:6px;position:absolute;top:12px;right:4px;}
.app-tab>div>span:hover{background:gray;border-radius:50%;color:#fff;}
.app-tab>div:hover{color:#2fd6a9;}
.app-tab>div.app-tab-actived{color:#2fd6a9;cursor:auto;}
.app-tab>div.app-tab-actived:after{content:' ';position:absolute;bottom:-1px;left:0;right:0;border-bottom:1px solid #fff;}
</style>
