<template>
  <div>
    <div class="app-toolbar">
      <el-button type="primary" size="small" @click="toAdd">添加角色</el-button>
    </div>
    <el-table :data="roles" :stripe="true" v-loading="loading">
      <el-table-column type="index" label=" "></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column prop="name" label="名称" width="180"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column fixed="right" label="操作" width="332">
        <template slot-scope="scope">
          <el-button @click="toAssignMenu(scope.row)" type="primary" size="small">分配菜单</el-button>
          <el-button @click="toAssignApi(scope.row)" type="primary" size="small">分配API</el-button>
          <el-button @click="toUpdate(scope.row)" type="primary" size="small">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="formTitle" :visible.sync="showForm" append-to-body>
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" :maxlength="40"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="6" placeholder="请输入描述" :maxlength="200"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="doSave">保 存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配菜单" :visible.sync="showAssignMenuWindow" class="role-manage-assign" append-to-body>
      <menu-manage :checkable="true" :editable="false" :roleId="roleIdOfAssignMenu" ref="menuManage"></menu-manage>
      <div slot="footer">
        <el-button @click="doAssignMenu" type="primary" size="small">分配</el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配API" :visible.sync="showAssignApiWindow" class="role-manage-assign" width="86%" append-to-body>
      <api-manage :checkable="true" :roleId="roleIdOfAssignApi" ref="apiManage"></api-manage>
      <div slot="footer">
        <el-button @click="doAssignApi" type="primary" size="small">分配</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MenuManage from './MenuManage'
import ApiManage from './ApiManage'

export default {
  name: 'role-manage',
  components: {
    MenuManage,
    ApiManage
  },
  data () {
    return {
      loading: false,
      roles: [],
      showForm: false,
      formTitle: '添加角色',
      form: {
        name: '',
        description: ''
      },
      formRule: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
      },
      currentUpdateRoleId: 0,
      showAssignMenuWindow: false,
      roleIdOfAssignMenu: 0,
      showAssignApiWindow: false,
      roleIdOfAssignApi: 0
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: '/web/api/roles'
      }).then((res) => {
        this.roles = res.data.data
        this.loading = false
      })
    },
    toAssignMenu (row) {
      this.showAssignMenuWindow = true
      this.roleIdOfAssignMenu = row.roleId
    },
    toAssignApi (row) {
      this.showAssignApiWindow = true
      this.roleIdOfAssignApi = row.roleId
    },
    toAdd () {
      this.formTitle = '添加角色'
      this.currentUpdateRoleId = 0
      this.form = {name: '', description: ''}
      this.showForm = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    toUpdate (row) {
      this.formTitle = '修改角色'
      this.currentUpdateRoleId = row.roleId
      this.form = {name: row.name, description: row.description}
      this.showForm = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    toDelete (row) {
      this.$store.commit('confirm', { title: '提示', msg: '您确认要删除该角色吗?', data: row, scope: this, callback: this.doDelete })
    },
    doAssignMenu () {
      this.$http.request({
        method: 'put',
        url: `/web/api/roles/${this.roleIdOfAssignMenu}/menus`,
        data: JSON.stringify(this.$refs.menuManage.getSelection())
      }).then(() => {
        this.showAssignMenuWindow = false
      })
    },
    doAssignApi () {
      this.$http.request({
        method: 'put',
        url: `/web/api/roles/${this.roleIdOfAssignApi}/apis`,
        data: JSON.stringify(this.$refs.apiManage.getSelection())
      }).then(() => {
        this.showAssignApiWindow = false
      })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let roleId = this.currentUpdateRoleId
          this.$http.request({
            method: roleId === 0 ? 'post' : 'put',
            url: roleId === 0 ? '/web/api/roles' : `/web/api/roles/${roleId}`,
            data: JSON.stringify({
              name: this.form.name,
              description: this.form.description
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
    doDelete (result, data) {
      if (result) {
        this.$http.request({
          method: 'delete',
          url: `/web/api/roles/${data.roleId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load()
        })
      }
    }
  }
}
</script>

<style>
.role-manage-assign .el-dialog__body{padding:0;}
</style>
