<template>
  <div class="app-content">
    <div class="app-toolbar">
      <div class="item left">
        <el-button size="small" @click="toAdd" type="primary">添加班级</el-button>
      </div>
      <div class="item" v-if="!schoolId">
        <label>学校</label>
        <el-select size="small" placeholder="请选择学校" v-model="query.schoolId" filterable remote :remote-method="searchSchool1" :loading="seachingSchool1" clearable style="width:100%">
          <el-option v-for="school in schools1" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
        </el-select>
      </div>
      <div class="item">
        <label>班级名称</label>
        <el-input size="small" placeholder="请输入班级名称" v-model="query.name" clearable></el-input>
      </div>
      <el-button size="small" @click="load(1)">查询</el-button>
    </div>
    <el-table :data="clazzs" :stripe="true" size="mini" v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="schoolName" label="学校"></el-table-column>
      <el-table-column prop="gradeName" label="年级" width="60px"></el-table-column>
      <el-table-column prop="name" label="班级" width="80px"></el-table-column>
      <el-table-column prop="teacherName" label="老师" width="120px"></el-table-column>
      <el-table-column prop="studentCount" label="学生数量" width="80px">
        <template slot-scope="scope">
          <el-link @click="toManageStudent(scope.row)" type="primary" size="small">{{scope.row.studentCount}}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="maxHeartRateThreshold" label="最大心率报警阈值" width="120px"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="145px"></el-table-column>
      <el-table-column prop="updateTime" label="最后修改时间" width="145px"></el-table-column>
      <el-table-column fixed="right" label="操作" width="238">
        <template slot-scope="scope">
          <el-button @click="toManageStudent(scope.row)" type="primary" size="small">学生管理</el-button>
          <el-button @click="toUpdate(scope.row)" type="primary" size="small">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="load" class="app-pagination"></el-pagination>

    <el-dialog :title="formTitle" :visible.sync="showForm" append-to-body>
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top">
        <el-form-item label="学校" prop="schoolId" v-if="!schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" filterable remote :remote-method="searchSchool2" :loading="seachingSchool2" style="width:100%" :disabled="!!currentUpdateClazzId" @change="onSchoolChange">
            <el-option v-for="school in schools2" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="form.grade" placeholder="请选择年级" style="width:100%">
            <el-option v-for="grade in grades" :key="grade.key" :label="grade.label" :value="grade.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="name">
          <el-input v-model="form.name" placeholder="请输入班级名称"></el-input>
        </el-form-item>
        <el-form-item label="老师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="请选择老师" filterable remote :remote-method="searchTeacher" :loading="seachingTeacher" style="width:100%">
            <el-option v-for="teacher in teachers" :key="teacher.teacherId" :label="teacher.name" :value="teacher.teacherId">
              <span style="float:left">{{ teacher.name }}{{ teacher.phone ? `(${teacher.phone})` : ''}}</span>
              <span style="float:right;color:#8492a6;font-size:13px">{{ teacher.schoolName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最大心率报警阈值" prop="maxHeartRateThreshold">
          <el-input-number v-model="form.maxHeartRateThreshold" placeholder="请输入最大心率报警阈值"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="doSave">保 存</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="`${clazzOfStudent.schoolName} ${clazzOfStudent.gradeName} ${clazzOfStudent.name}`" :visible.sync="showStudentDialog" width="86%" center append-to-body @close="load(query.page)">
      <student-manage :clazz="clazzOfStudent" ref="studentManage"></student-manage>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { calcPage } from '@/util'
import { DICTIONARY_ID_GRADE } from '@/config'
import StudentManage from './StudentManage'

export default {
  name: 'clazz-manage',
  components: {
    StudentManage
  },
  data () {
    return {
      loading: false,
      clazzs: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        schoolId: null,
        name: ''
      },
      seachingSchool1: false,
      schools1: [],
      seachingSchool2: false,
      schools2: [],
      seachingTeacher: false,
      teachers: [],
      grades: [],
      showForm: false,
      formTitle: '添加班级',
      form: {
        schoolId: null,
        grade: null,
        name: '',
        teacherId: null,
        maxHeartRateThreshold: 200
      },
      formRule: {
        schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }],
        grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
        name: [
          { required: true, message: '请输入班级名称', trigger: 'blur' },
          { max: 10, message: '最多10个字符', trigger: 'blur' }
        ],
        teacherId: [{ required: true, message: '请选择老师', trigger: 'change' }],
        maxHeartRateThreshold: [{ required: true, message: '请输入最大心率报警阈值', trigger: 'blur' }]
      },
      currentUpdateClazzId: 0,
      showStudentDialog: false,
      clazzOfStudent: {}
    }
  },
  computed: {
    admin () {
      return this.$store.state.admin
    },
    schoolId () {
      return this.admin.schoolId
    }
  },
  created () {
    Vue.biz.loadDictionary(DICTIONARY_ID_GRADE, (grades) => {
      this.grades = grades
      this.load(1)
    })
    if (!this.schoolId) {
      this.searchSchool1()
    }
  },
  methods: {
    load (page) {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/clazzs?page=${page}&limit=${this.query.limit}&name=${this.query.name || ''}&schoolId=${this.schoolId || this.query.schoolId || ''}`
      }).then((res) => {
        let pageData = res.data.data
        let clazzs = pageData.data
        for (let i = clazzs.length - 1; i >= 0; i--) {
          clazzs[i].gradeName = this.getGradeName(clazzs[i].grade)
        }
        this.clazzs = clazzs
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getGradeName (gradeValue) {
      for (let i = 0; i < this.grades.length; i++) {
        let grade = this.grades[i]
        if (grade.key === gradeValue) {
          return grade.label
        }
      }
      return gradeValue
    },
    searchSchool1 (query, callback) {
      this.searchSchool(1, query, callback)
    },
    searchSchool2 (query, callback) {
      this.searchSchool(2, query, callback)
    },
    searchSchool (num, query, callback) {
      this[`seachingSchool${num}`] = true
      this.$http.request({
        method: 'get',
        url: `/web/api/schools?page=1&limit=10&name=${query || ''}`
      }).then((res) => {
        this[`schools${num}`] = res.data.data.data
        this[`seachingSchool${num}`] = false
        callback()
      }).catch(() => {
        this[`seachingSchool${num}`] = false
      })
    },
    onSchoolChange () {
      this.form.teacherId = null
      this.searchTeacher()
    },
    searchTeacher (query) {
      this.seachingTeacher = true
      this.$http.request({
        method: 'get',
        url: `/web/api/teachers?page=1&limit=10&name=${query || ''}&schoolId=${this.schoolId || this.form.schoolId || ''}`
      }).then((res) => {
        this.teachers = res.data.data.data
        this.seachingTeacher = false
      }).catch(() => {
        this.seachingTeacher = false
      })
    },
    toAdd () {
      if (this.schoolId) {
        this.toAdd1()
        this.searchTeacher()
      } else {
        this.searchSchool2('', () => {
          this.toAdd1()
        })
      }
    },
    toAdd1 () {
      this.formTitle = '添加班级'
      this.currentUpdateClazzId = 0
      this.form = {
        schoolId: this.schoolId,
        grade: null,
        name: '',
        teacherId: null,
        maxHeartRateThreshold: 200
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toUpdate (row) {
      this.schools2 = [{ schoolId: row.schoolId, name: row.schoolName }]
      this.teachers = [{ teacherId: row.teacherId, name: row.teacherName }]
      this.formTitle = '修改班级'
      this.currentUpdateClazzId = row.clazzId
      this.form = {
        schoolId: row.schoolId,
        grade: row.grade,
        name: row.name,
        teacherId: row.teacherId,
        maxHeartRateThreshold: row.maxHeartRateThreshold
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toDelete (row) {
      this.$confirm('您确认要删除该班级吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.request({
          method: 'delete',
          url: `/web/api/clazzs/${row.clazzId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load(calcPage(this.query))
        })
      })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let clazzId = this.currentUpdateClazzId
          this.$http.request({
            method: clazzId === 0 ? 'post' : 'put',
            url: clazzId === 0 ? '/web/api/clazzs' : `/web/api/clazzs/${clazzId}`,
            data: JSON.stringify({
              schoolId: this.form.schoolId,
              grade: this.form.grade,
              name: this.form.name,
              teacherId: this.form.teacherId,
              maxHeartRateThreshold: this.form.maxHeartRateThreshold
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
    toManageStudent (clazz) {
      this.clazzOfStudent = clazz
      this.showStudentDialog = true
      this.$nextTick(() => {
        this.$refs.studentManage.load()
      })
    }
  }
}
</script>
