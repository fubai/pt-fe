<template>
  <div class="app-content">
    <el-tree :data="apiGroups" :show-checkbox="checkable" node-key="apiId" :props="{children:'children',label:'name'}" ref="tree" v-loading="loading" style="padding:10px">
      <div slot-scope="{ node, data }" class="api-manage-node">
        <span>{{ data.name }}</span>
        <div v-if="data.method">
          <span>{{ data.method }}</span>
          <span>{{ data.url }}</span>
          <span>{{ data.createTime }}</span>
        </div>
      </div>
    </el-tree>
  </div>
</template>

<script>
export default {
  name: 'api-manage',
  props: {
    checkable: {type: Boolean, require: false, default: false},
    roleId: {type: Number, require: false, default: 0}
  },
  data () {
    return {
      loading: false,
      apis: [],
      apiGroups: []
    }
  },
  created () {
    this.load()
  },
  watch: {
    'roleId' () {
      this.load()
    }
  },
  methods: {
    load () {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/apis?roleId=${this.roleId}`
      }).then((res) => {
        let apis = res.data.data || []
        let apiGroups = []
        let temp = {}
        for (let api of apis) {
          let names = (api.apiGroup || '').split('#')
          if (names.length === 2) {
            let groupName = names[0]
            let apiName = names[1]
            let group = temp[groupName]
            if (!group) {
              group = { name: groupName, apiId: `group_${groupName}`, children: [] }
              temp[groupName] = group
              apiGroups.push(group)
            }
            group.children.push({
              name: apiName,
              apiId: api.apiId,
              method: api.method,
              url: api.url,
              createTime: api.createTime,
              roleId: api.roleId
            })
          } else {
            apiGroups.push(Object.assign({ name: '-' }, api))
          }
        }
        this.apiGroups = apiGroups
        this.apis = apis
        this.loading = false

        if (this.roleId) {
          this.$nextTick(() => {
            let selectedApiNodes = []
            this.apis.forEach(api => {
              if (api.roleId === this.roleId) {
                selectedApiNodes.push(api.apiId)
              }
            })
            this.$refs.tree.setCheckedKeys(selectedApiNodes)
          })
        }
      })
    },
    getSelection () {
      let toAdds = []
      let temp = {}
      let selectedApiNodes = this.$refs.tree.getCheckedNodes()
      for (let selected of selectedApiNodes) {
        let apiId = selected.apiId
        if (Object.prototype.toString.call(apiId) === '[object String]' && apiId.startsWith('group_')) {
          continue
        }
        if (!selected.roleId) {
          toAdds.push(selected.apiId)
        }
        temp[selected.apiId] = selected
      }
      let toDeletes = []
      let apis = this.apis
      for (let api of apis) {
        if (api.roleId && !temp[api.apiId]) {
          toDeletes.push(api.apiId)
        }
      }

      return {toAdds: toAdds, toDeletes: toDeletes}
    }
  }
}
</script>

<style>
.api-manage-node{flex:1;display:flex;align-items:center;justify-content:space-between;font-size:14px;padding-right:8px;}
.api-manage-node>div{width:880px;}
.api-manage-node>div>span{display:inline-block;}
.api-manage-node>div>span:nth-child(1){width:72px;}
.api-manage-node>div>span:nth-child(3){float:right;}
</style>
