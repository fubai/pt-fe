<template>
  <div>
    <div class="app-toolbar">
      <el-button size="small" @click="toAdd" type="primary" class="left">添加老师</el-button>
      <label>老师姓名</label>
      <el-input size="small" placeholder="请输入老师姓名" v-model="query.name" clearable></el-input>
      <label>老师手机</label>
      <el-input size="small" placeholder="请输入老师手机" v-model="query.phone" clearable></el-input>
      <el-button size="small" @click="load(1)">查询</el-button>
    </div>
    <el-table :data="teachers" :stripe="true" size="mini" v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="schoolName" label="学校"></el-table-column>
      <el-table-column prop="name" label="老师姓名"></el-table-column>
      <el-table-column prop="phone" label="老师手机"></el-table-column>
      <el-table-column prop="clazzCount" label="班级数量"></el-table-column>
      <el-table-column prop="studentCount" label="学生数量"></el-table-column>
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

    <el-dialog :title="formTitle" :visible.sync="showForm" append-to-body>
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top">
        <el-form-item label="老师姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入老师姓名" :maxlength="40"></el-input>
        </el-form-item>
        <el-form-item label="老师手机" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入老师手机" :maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="学校" prop="schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" filterable remote :remote-method="searchSchool" :loading="seachingSchool" style="width:100%">
            <el-option v-for="school in schools" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
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
import { calcPage } from '@/util'

export default {
  name: 'teacher-manage',
  data () {
    return {
      loading: false,
      teachers: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        name: '',
        phone: ''
      },
      seachingSchool: false,
      schools: [],
      showForm: false,
      formTitle: '添加老师',
      form: {
        name: '',
        phone: '',
        schoolId: null
      },
      formRule: {
        name: [{ required: true, message: '请输入老师姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入老师手机', trigger: 'blur' },
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
        schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }]
      },
      currentUpdateTeacherId: 0
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
        url: `/web/api/teachers?page=${page}&limit=${this.query.limit}&name=${this.query.name || ''}&phone=${this.query.phone || ''}`
      }).then((res) => {
        let pageData = res.data.data
        this.teachers = pageData.data
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      }).catch(() => {
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
    toAdd () {
      this.searchSchool('', () => {
        this.formTitle = '添加老师'
        this.currentUpdateTeacherId = 0
        this.form = {
          name: '',
          phone: '',
          schoolId: ''
        }
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
        this.showForm = true
      })
    },
    toUpdate (row) {
      this.searchSchool(row.schoolName, () => {
        this.formTitle = '修改老师'
        this.currentUpdateTeacherId = row.teacherId
        this.form = {
          name: row.name,
          phone: row.phone,
          schoolId: row.schoolId
        }
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
        this.showForm = true
      })
    },
    toDelete (row) {
      this.$confirm('您确认要删除该老师吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.request({
          method: 'delete',
          url: `/web/api/teachers/${row.teacherId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load(calcPage(this.query))
        })
      })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let teacherId = this.currentUpdateTeacherId
          this.$http.request({
            method: teacherId === 0 ? 'post' : 'put',
            url: teacherId === 0 ? '/web/api/teachers' : `/web/api/teachers/${teacherId}`,
            data: JSON.stringify({
              name: this.form.name,
              phone: this.form.phone,
              schoolId: this.form.schoolId
            })
          }).then(() => {
            this.showForm = false
            this.load(this.query.page)
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
