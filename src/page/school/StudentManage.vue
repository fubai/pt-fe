<template>
  <div v-loading="uploading">
    <div style="text-align:right;padding-bottom:10px;">
      <el-button size="small" @click="toAdd" type="primary" class="left">添加学生</el-button>
      <el-upload :action="uploadExcelUrl" :with-credentials="true" :show-file-list="false" :data="{ schoolId: clazz.schoolId, clazzId: clazz.clazzId }" accept=".xls,.xlsx" :before-upload="beforeUpload" :on-success="onUploadSuccess" :on-error="onUploadFail" class="student-upload">
        <el-button size="small" type="primary">批量上传学生信息</el-button>
      </el-upload>
    </div>
    <el-table :data="students" :stripe="true" border size="mini" v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="num" label="学号"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="gender" label="性别" :formatter="genderFormatter"></el-table-column>
      <el-table-column prop="birthday" label="生日" :formatter="birthdayFormatter"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column prop="updateTime" label="最后修改时间"></el-table-column>
      <el-table-column fixed="right" label="操作" width="158">
        <template slot-scope="scope">
          <el-button @click="toUpdate(scope.row)" type="primary" size="small">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="formTitle" :visible.sync="showForm" width="360px" append-to-body>
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" :maxlength="40"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio border label="MALE">男</el-radio>
            <el-radio border label="FEMALE">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker v-model="form.birthday" type="date" placeholder="请选择出生日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" :picker-options="birthdayPickerOptions"></el-date-picker>
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
import { api } from '@/config'
import Vue from 'vue'

export default {
  name: 'student-manage',
  props: {
    clazz: { type: Object, require: true }
  },
  data () {
    return {
      uploadExcelUrl: `${api}/web/api/students/batch`,
      uploading: false,
      birthdayPickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      loading: false,
      students: [],
      showForm: false,
      formTitle: '添加学生',
      form: {
        name: '',
        gender: null,
        birthday: null
      },
      formRule: {
        name: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择学生性别', trigger: 'change' }],
        birthday: [{ required: true, message: '请选择学生出生日期', trigger: 'change' }]
      },
      currentUpdateStudentId: 0
    }
  },
  created () {
    this.load(1)
  },
  methods: {
    load () {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/students?clazzId=${this.clazz.clazzId}`
      }).then((res) => {
        this.students = res.data.data || []
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    toAdd () {
      this.formTitle = '添加学生'
      this.currentUpdateStudentId = 0
      this.form = {
        name: '',
        gender: null,
        birthday: null
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toUpdate (row) {
      this.formTitle = '修改学生'
      this.currentUpdateStudentId = row.studentId
      this.form = {
        schoolId: this.clazz.schoolId,
        clazzId: this.clazz.clazzId,
        name: row.name,
        gender: row.gender,
        birthday: row.birthday
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toDelete (row) {
      this.$confirm('您确认要删除该学生吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.request({
          method: 'delete',
          url: `/web/api/students/${row.studentId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load()
        })
      })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let studentId = this.currentUpdateStudentId
          this.$http.request({
            method: studentId === 0 ? 'post' : 'put',
            url: studentId === 0 ? '/web/api/students' : `/web/api/students/${studentId}`,
            data: JSON.stringify({
              schoolId: this.clazz.schoolId,
              clazzId: this.clazz.clazzId,
              name: this.form.name,
              gender: this.form.gender,
              birthday: `${this.form.birthday} 00:00:00`
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
    genderFormatter (row, column, cellValue) {
      if (cellValue === 'MALE') {
        return '男'
      }
      if (cellValue === 'FEMALE') {
        return '女'
      }
      return cellValue
    },
    birthdayFormatter (row, column, cellValue) {
      let age = Vue.biz.calcAge(new Date(cellValue))
      return `${cellValue.substring(0, 10)} (${age}岁)`
    },
    beforeUpload () {
      this.uploading = true
    },
    onUploadSuccess () {
      this.uploading = false
      this.load(1)
    },
    onUploadFail (err) {
      this.uploading = false

      let message = err.message
      if (!message) {
        console.dir(err)
        return
      }

      try {
          this.$message.error(JSON.parse(message).message)
      } catch (e) {
        console.dir(e)
      }
    }
  }
}
</script>

<style>
.student-upload{display:inline-block;margin-left:10px;}
</style>
