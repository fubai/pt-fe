<template>
  <div>
    <div class="app-toolbar">
      <template v-if="!admin.schoolId">
        <label>学校</label>
        <el-select size="small" placeholder="请选择学校" v-model="query.schoolId" filterable remote :remote-method="searchSchool" :loading="seachingSchool" @change="onSchoolChange" clearable>
          <el-option v-for="school in schools" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
        </el-select>
      </template>
      <label>班级</label>
      <el-select size="small" placeholder="请选择班级" v-model="query.clazzId" clearable>
        <el-option v-for="clazz in clazzs" :key="clazz.clazzId" :label="getClazzLabel(clazz.grade, clazz.name)" :value="clazz.clazzId"></el-option>
      </el-select>
      <label>老师</label>
      <el-select size="small" placeholder="请选择老师" v-model="query.teacherId" clearable>
        <el-option v-for="teacher in teachers" :key="teacher.teacherId" :label="teacher.name" :value="teacher.teacherId"></el-option>
      </el-select>
      <el-button size="small" @click="load(1)">查询</el-button>
    </div>
    <el-table :data="trains" :stripe="true" size="mini" v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="startTime" label="上课时间" :formatter="timeFormatter"></el-table-column>
      <el-table-column prop="courseName" label="课程"></el-table-column>
      <el-table-column prop="schoolName" label="学校"></el-table-column>
      <el-table-column prop="clazzName" label="班级">
        <template slot-scope="scope">{{getClazzLabel(scope.row.clazzGrade, scope.row.clazzName)}}</template>
      </el-table-column>
      <el-table-column prop="teacherName" label="老师"></el-table-column>
      <el-table-column prop="studentCount" label="学生" :formatter="studentCountFormatter"></el-table-column>
      <el-table-column fixed="right" label="操作" width="90">
        <template slot-scope="scope">
          <el-button @click="toView(scope.row)" type="text" size="small">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="load" class="app-pagination"></el-pagination>
  </div>
</template>

<script>
import Vue from 'vue'
import { DICTIONARY_ID_GRADE } from '@/config'

export default {
  name: 'train-lilst',
  data () {
    return {
      loading: false,
      trains: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        schoolId: null,
        clazzId: null,
        teacherId: null
      },
      seachingSchool: false,
      schools: [],
      clazzs: [],
      teachers: [],
      grades: [],
      schoolClazzMap: {},
      schoolTeacherMap: {}
    }
  },
  computed: {
    admin () {
      return this.$store.state.admin
    },
    schoolId () {
      return this.admin.schoolId || this.query.schoolId
    }
  },
  created () {
    Vue.biz.loadDictionary(DICTIONARY_ID_GRADE, (grades) => {
      this.grades = grades
      this.load(1)
    })

    if (this.schoolId) {
      this.loadClazz()
      this.loadTeacher()
    } else {
      this.searchSchool()
    }
  },
  methods: {
    load (page) {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/trains?page=${page}&limit=${this.query.limit}&schoolId=${this.query.schoolId || ''}&clazzId=${this.query.clazzId || ''}&teacherId=${this.query.teacherId || ''}`
      }).then((res) => {
        let pageData = res.data.data
        this.trains = pageData.data
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    searchSchool (query) {
      this.seachingSchool = true
      this.$http.request({
        method: 'get',
        url: `/web/api/schools?page=1&limit=10&name=${query || ''}`
      }).then((res) => {
        this.schools = res.data.data.data
        this.seachingSchool = false
      }).catch(() => {
        this.seachingSchool = false
      })
    },
    onSchoolChange (schoolId) {
      this.query.clazzId = null
      this.query.teacherId = null
      this.loadClazz()
      this.loadTeacher()
    },
    loadClazz () {
      let schoolId = this.schoolId
      if (!schoolId) {
        this.clazzs = []
        return
      }

      this.clazzs = this.schoolClazzMap[schoolId]
      if (this.clazzs) {
        return
      }

      this.$http.request({
        method: 'get',
        url: `/web/api/clazzs?page=1&limit=99999999&schoolId=${schoolId}`
      }).then((res) => {
        let clazzs = res.data.data.data
        for (let i = clazzs.length - 1; i >= 0; i--) {
          clazzs[i].gradeName = this.getGradeName(clazzs[i].grade)
        }
        this.schoolClazzMap[schoolId] = clazzs

        this.clazzs = clazzs
      })
    },
    loadTeacher () {
      let schoolId = this.schoolId
      if (!schoolId) {
        this.teachers = []
        return
      }

      this.teachers = this.schoolTeacherMap[schoolId]
      if (this.teachers) {
        return
      }

      this.$http.request({
        method: 'get',
        url: `/web/api/teachers?page=1&limit=99999999&schoolId=${schoolId}`
      }).then((res) => {
        let teachers = res.data.data.data
        this.schoolTeacherMap[schoolId] = teachers

        this.teachers = teachers
      })
    },
    getClazzLabel (clazzGrade, clazzName) {
      return `${this.getGradeName(clazzGrade)}${clazzName}`
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
    timeFormatter (row, column, cellValue) {
      return `${row.startTime.substring(0, 16)} ~ ${row.endTime.substring(10, 16)}`
    },
    studentCountFormatter (row, column, cellValue) {
      return `0`
    },
    toView (row) {
      console.dir(row)
    }
  }
}
</script>