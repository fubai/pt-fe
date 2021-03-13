<template>
  <div>
    <div class="app-toolbar">
      <el-button size="small" @click="toAdd" type="primary" class="left">添加学校</el-button>
      <label>学校名称</label>
      <el-input size="small" placeholder="请输入学校名称" v-model="query.name" clearable></el-input>
      <el-button size="small" @click="load(1)">查询</el-button>
    </div>
    <el-table :data="schools" :stripe="true" size="mini" v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="name" label="学校名称"></el-table-column>
      <el-table-column prop="linker" label="联系人"></el-table-column>
      <el-table-column prop="linkerPhone" label="联系人电话"></el-table-column>
      <el-table-column prop="post" label="联系人职务"></el-table-column>
      <el-table-column prop="status" label="状态" :formatter="statusFormatter"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column prop="updateTime" label="最后修改时间"></el-table-column>
      <el-table-column fixed="right" label="操作" width="218">
        <template slot-scope="scope">
          <el-button @click="toUpdate(scope.row)" type="primary" size="small">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="load" class="app-pagination"></el-pagination>

    <el-dialog :title="formTitle" :visible.sync="showForm" @close="resetForm" append-to-body>
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top">
        <el-form-item label="学校名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学校名称" :maxlength="40"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="linker">
          <el-input v-model="form.linker" placeholder="请输入联系人" :maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="联系人电话" prop="linkerPhone">
          <el-input v-model="form.linkerPhone" placeholder="请输入联系人电话" :maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="联系人职务" prop="post">
          <el-input v-model="form.post" placeholder="请输入联系人职务" :maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio border label="ENABLE">已开通</el-radio>
            <el-radio border label="DISABLE">未开通</el-radio>
          </el-radio-group>
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
import { calcPage } from '@/util'

export default {
  name: 'school-manage',
  data () {
    return {
      loading: false,
      schools: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        name: ''
      },
      showForm: false,
      formTitle: '添加学校',
      form: {
        name: '',
        linker: '',
        linkerPhone: '',
        post: '',
        status: 'ENABLE'
      },
      formRule: {
        name: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
        linker: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        linkerPhone: [
          { required: true, message: '请输入联系人电话', trigger: 'blur' },
          { min: 11, max: 11, message: '长度必须是11位', trigger: 'blur' },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              let valid= /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(value)
              if (valid) {
                callback()
              } else {
                callback(new Error('手机号码格式不正确'))
              }
            }
          }
        ],
        post: [{ required: true, message: '请输入联系人职务', trigger: 'blur' }]
      },
      currentUpdateSchoolId: 0
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
        url: `/web/api/schools?page=${page}&limit=${this.query.limit}&name=${this.query.name}`
      }).then((res) => {
        let pageData = res.data.data
        this.schools = pageData.data
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    toAdd () {
      this.formTitle = '添加学校'
      this.currentUpdateSchoolId = 0
      this.form = {
        name: '',
        linker: '',
        linkerPhone: '',
        post: '',
        status: 'ENABLE'
      }
      this.showForm = true
    },
    toUpdate (row) {
      this.formTitle = '修改学校'
      this.currentUpdateSchoolId = row.schoolId
      this.form = {
        name: row.name,
        linker: row.linker,
        linkerPhone: row.linkerPhone,
        post: row.post,
        status: row.status
      }
      this.showForm = true
    },
    toDelete (row) {
      this.$confirm('您确认要删除该学校吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.request({
          method: 'delete',
          url: `/web/api/schools/${row.schoolId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load(calcPage(this.query))
        })
      })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let schoolId = this.currentUpdateSchoolId
          this.$http.request({
            method: schoolId === 0 ? 'post' : 'put',
            url: schoolId === 0 ? '/web/api/schools' : `/web/api/schools/${schoolId}`,
            data: JSON.stringify({
              name: this.form.name,
              linker: this.form.linker,
              linkerPhone: this.form.linkerPhone,
              post: this.form.post,
              status: this.form.status
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
    resetForm () {
      this.$refs.form.resetFields()
    },
    statusFormatter (row, column, cellValue) {
      return cellValue === 'ENABLE' ? '已开通' : '未开通'
    }
  }
}
</script>
