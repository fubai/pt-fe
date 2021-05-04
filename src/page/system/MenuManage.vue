<template>
  <div class="app-content">
    <div class="app-toolbar" v-if="editable">
      <el-button size="small" @click="toAdd()" type="primary">添加一级菜单</el-button>
    </div>
    <el-tree :data="menus" node-key="menuId" :default-expand-all="true" :expand-on-click-node="false" :show-checkbox="checkable" @node-click="toUpdate" v-loading="loading" class="menu-manage-tree" ref="tree">
      <span slot-scope="{ node, data }" class="menu-manage-node">
        <span>{{ data.name }}</span>
        <div class="menu-manage-buttons" v-if="editable">
          <el-button type="text" size="mini" v-if="!data.parentId" @click.stop.prevent="toAdd(data.menuId, data.name)">添加二级菜单</el-button>
          <el-button type="text" size="mini" @click.stop.prevent="toDelete(data)">删除</el-button>
        </div>
      </span>
    </el-tree>
    <el-dialog :title="formTitle" :visible.sync="showForm">
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top">
        <el-form-item label="上级菜单" prop="parentName">
          <el-input v-model="form.parentName" :readonly="true"></el-input>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" :maxlength="40"></el-input>
        </el-form-item>
        <el-form-item label="菜单地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入菜单地址" :maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入菜单图标" :maxlength="40"></el-input>
        </el-form-item>
        <el-form-item label="菜单参数" prop="param">
          <el-input v-model="form.param" placeholder="请输入菜单参数" :maxlength="200"></el-input>
        </el-form-item>
        <el-form-item label="菜单序号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入菜单序号" :maxlength="4" type="number"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="doSave">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'menu-manage',
  props: {
    checkable: {type: Boolean, require: false, default: false},
    editable: {type: Boolean, require: false, default: true},
    roleId: {type: Number, require: false, default: 0}
  },
  data () {
    return {
      loading: false,
      menus: [],
      showForm: false,
      formTitle: '添加一级菜单',
      form: {
        parentId: null,
        parentName: '',
        name: '',
        address: '',
        icon: '',
        param: '',
        orderNo: 0
      },
      formRule: {
        name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入菜单地址', trigger: 'blur' }],
        orderNo: [{ required: true, message: '请输入菜单序号', trigger: 'blur' }]
      },
      currentUpdateMenuId: 0,
      checked: []
    }
  },
  watch: {
    roleId: {
      handler: function () {
        this.load()
      },
      immediate: true
    }
  },
  methods: {
    load () {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/roles/${this.roleId}/menus`
      }).then(res => {
        let menus = res.data.data
        let menuMap = {}
        let result = []
        let checked = []
        let checked1 = []
        for (let menu of menus) {
          menuMap[menu.menuId] = menu
          if (!menu.parentId) {
            result.push(menu)
          }
        }
        for (let menu of menus) {
          if (menu.parentId) {
            let parentMenu = menuMap[menu.parentId]
            if (!parentMenu) {
              continue
            }
            menu.parentName = parentMenu.name

            let children = parentMenu.children || []
            children.push(menu)
            parentMenu.children = children
          }
        }
        for (let menu of menus) {
          if (menu.roleId) {
            checked.push(menu.menuId)

            if (!menu.children || !menu.children.length) {
              checked1.push(menu.menuId)
            }
          }
        }
        this.menus = result
        this.checked = checked
        this.$refs.tree.setCheckedKeys(checked1)
        this.loading = false
      })
    },
    toAdd (parentId, parentName) {
      if (!this.editable) return
      this.formTitle = !parentId ? '添加一级菜单' : '添加二级菜单'
      this.currentUpdateMenuId = 0
      this.form = {parentId: parentId || '', parentName: parentName || '', name: '', address: null, icon: null, param: null, orderNo: null}
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toUpdate (menu) {
      if (!this.editable) return
      this.formTitle = '修改菜单'
      this.currentUpdateMenuId = menu.menuId
      this.form = {parentId: menu.parentId, parentName: menu.parentName, name: menu.name, address: menu.address, icon: menu.icon, param: menu.param, orderNo: menu.orderNo}
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toDelete (menu) {
      if (!this.editable) return
      this.$confirm('您确认要删除该菜单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.request({
          method: 'delete',
          url: `/web/api/menus/${menu.menuId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load()
        })
      })
    },
    doSave () {
      if (!this.editable) {
        return
      }
      this.$refs.form.validate((success) => {
        if (success) {
          let menuId = this.currentUpdateMenuId
          this.$http.request({
            method: menuId === 0 ? 'post' : 'put',
            url: menuId === 0 ? `/web/api/menus` : `/web/api/menus/${menuId}`,
            data: JSON.stringify({
              parentId: this.form.parentId,
              name: this.form.name,
              address: this.form.address,
              icon: this.form.icon,
              param: this.form.param,
              orderNo: this.form.orderNo
            })
          }).then(() => {
            this.showForm = false
            this.load()
          })
        } else {
          return false
        }
      })
    },
    getSelection () {
      let selection = {}
      let nodes = this.$refs.tree.getCheckedNodes()
      for (let node of nodes) {
        selection[node.menuId] = node.menuId
        if (node.parentId) {
          selection[node.parentId] = node.parentId
        }
      }

      let toAdds = []
      let checked = this.checked
      for (let selectedMenuId in selection) {
        let found = false
        for (let oldMenuId of checked) {
          if (selection[selectedMenuId] === oldMenuId) {
            found = true
            break
          }
        }
        if (!found) {
          toAdds.push(selectedMenuId)
        }
      }

      let toDeletes = []
      for (let oldMenuId of checked) {
        let found = false
        for (let selectedMenuId in selection) {
          if (oldMenuId === selection[selectedMenuId]) {
            found = true
            break
          }
        }
        if (!found) {
          toDeletes.push(oldMenuId)
        }
      }

      return { toAdds: toAdds, toDeletes: toDeletes }
    }
  }
}
</script>

<style>
.menu-manage-tree{margin:10px;}
.menu-manage-tree .el-tree-node__content{position:relative;}
.menu-manage-node{font-size:14px;}
.menu-manage-buttons{position:absolute;top:0;right:10px;}
</style>
