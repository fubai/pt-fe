<template>
  <div>
    <div class="app-toolbar">
      <div class="item left">
        <el-button size="small" @click="toAdd" type="primary">添加管理员</el-button>
      </div>
      <div class="item">
        <label>登录账号</label>
        <el-input size="small" placeholder="请输入登录账号" v-model="query.username" clearable></el-input>
      </div>
      <div class="item">
        <label>联系电话</label>
        <el-input size="small" placeholder="请输入联系电话" v-model="query.mobile" clearable></el-input>
      </div>
      <el-button size="small" @click="load(1)">查询</el-button>
    </div>
    <el-table :data="bizAdmins" :stripe="true" size="mini" v-loading="loading">
      <el-table-column prop="createTime" label="创建时间" width="145px"></el-table-column>
      <el-table-column prop="username" label="登录账号"></el-table-column>
      <el-table-column prop="mobile" label="联系电话"></el-table-column>
      <el-table-column prop="schoolName" label="所属学校"></el-table-column>
      <el-table-column prop="roleName" label="角色"></el-table-column>
      <el-table-column prop="status" label="状态" width="60px" :formatter="statusFormatter"></el-table-column>
      <el-table-column fixed="right" label="操作" width="218">
        <template slot-scope="scope">
          <el-button @click="toUpdate(scope.row)" type="primary" size="small">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small">删除</el-button>
          <el-button @click="changeStatus(scope.row)" type="danger" size="small" v-if="scope.row.status === 'ENABLE'">禁用</el-button>
          <el-button @click="changeStatus(scope.row)" type="danger" size="small" v-if="scope.row.status === 'DISABLE'">启用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="load" class="app-pagination"></el-pagination>

    <el-dialog :title="formTitle" :visible.sync="showForm" append-to-body>
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top">
        <el-form-item label="学校" prop="schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" filterable remote :remote-method="searchSchool" :loading="seachingSchool" :clearable="true" @clear="onClearSchool" style="width:100%">
            <el-option v-for="school in schools" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" :maxlength="40" :readonly="!!currentUpdateAdminId"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入登录密码" :maxlength="40" type="password"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号码" :maxlength="11"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width:100%">
            <el-option v-for="role in bizRoles" :key="role.roleId" :label="role.name" :value="role.roleId"></el-option>
          </el-select>
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
import md5 from 'js-md5'
import { calcPage } from '@/util'

export default {
  name: 'admin-manage',
  data () {
    return {
      loading: false,
      bizAdmins: [],
      bizRoles: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        username: '',
        mobile: ''
      },
      seachingSchool: false,
      schools: [],
      showForm: false,
      formTitle: '添加管理员',
      form: {
        username: '',
        password: '',
        mobile: '',
        schoolId: null,
        roleId: null
      },
      formRule: {
        username: [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 6, message: '长度不能小于6位', trigger: 'blur' }
        ],
        mobile: [{ min: 11, max: 11, message: '长度必须是11位', trigger: 'blur' }],
        roleId: [{ required: true, message: '请选择角色', trigger: 'blur' }],
        password: [{
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (!this.currentUpdateAdminId && !value) {
              callback(new Error('请输入登录密码'))
            } else {
              callback()
            }
          }
        }]
      },
      currentUpdateAdminId: 0
    }
  },
  created () {
    this.load(1)
  },
  methods: {
    load (page) {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/admins?page=${page}&limit=${this.query.limit}&username=${this.query.username}&mobile=${this.query.mobile}`
      }).then((res) => {
        let pageData = res.data.data
        this.bizAdmins = pageData.data
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      })
    },
    searchSchool (query, callback) {
      this.seachingSchool = true
      this.$http.request({
        method: 'get',
        url: `/web/api/schools?page=1&limit=10&name=${query || ''}`
      }).then((res) => {
        this.schools = res.data.data.data
        this.seachingSchool = false
        callback()
      }).catch(() => {
        this.seachingSchool = false
      })
    },
    loadRole () {
      this.$http.request({
        method: 'get',
        url: `/web/api/roles`
      }).then((res) => {
        this.bizRoles = res.data.data
      })
    },
    toAdd () {
      this.searchSchool('', () => {
        this.formTitle = '添加管理员'
        this.currentUpdateAdminId = 0
        this.form = {username: '', password: '', mobile: '', roleId: null}
        this.showForm = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      })
      this.loadRole()
    },
    toUpdate (row) {
      this.searchSchool(row.schoolName, () => {
        this.formTitle = '修改管理员'
        this.currentUpdateAdminId = row.adminId
        this.form = {username: row.username, password: '', mobile: row.mobile, schoolId: row.schoolId, roleId: row.roleId}
        this.showForm = true
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      })
      this.loadRole()
    },
    toDelete (row) {
      this.$confirm('您确认要删除该管理员吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.request({
          method: 'delete',
          url: `/web/api/admins/${row.adminId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load(calcPage(this.query))
        })
      })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let adminId = this.currentUpdateAdminId
          this.$http.request({
            method: adminId === 0 ? 'post' : 'put',
            url: adminId === 0 ? '/web/api/admins' : `/web/api/admins/${adminId}`,
            data: JSON.stringify({
              username: this.form.username,
              password: this.form.password ? md5(this.form.password) : '',
              mobile: this.form.mobile,
              schoolId: this.form.schoolId,
              roleId: this.form.roleId
            })
          }).then(() => {
            this.showForm = false
            this.load(this.query.page)
          })
        } else {
          return false
        }
      })
    },
    onClearSchool () {
      this.form.schoolId = null
    },
    changeStatus (row) {
      this.$http.request({
        method: 'put',
        url: `/web/api/admins/${row.adminId}/status`,
        data: JSON.stringify({
          status: row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
        })
      }).then(() => {
        this.load(this.query.page)
      })
    },
    statusFormatter (row, column, cellValue) {
      return cellValue === 'ENABLE' ? '启用' : '禁用'
    }
  }
}
</script>
