<template>
  <div>
    <div class="app-toolbar">
      <div class="item">
        <label>日期</label>
        <el-date-picker v-model="query.dates" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:270px;"></el-date-picker>
      </div>
      <div class="item" v-if="!admin.schoolId">
        <label>学校</label>
        <el-select size="small" placeholder="请选择学校" v-model="query.schoolId" filterable remote :remote-method="searchSchool" :loading="seachingSchool" @change="onSchoolChange" clearable>
          <el-option v-for="school in schools" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
        </el-select>
      </div>
      <div class="item">
        <label>班级</label>
        <el-select size="small" placeholder="请选择班级" v-model="query.clazzId" clearable>
          <el-option v-for="clazz in clazzs" :key="clazz.clazzId" :label="getClazzLabel(clazz.grade, clazz.name)" :value="clazz.clazzId"></el-option>
        </el-select>
      </div>
      <div class="item" v-if="!admin.teacherId">
        <label>老师</label>
        <el-select size="small" placeholder="请选择老师" v-model="query.teacherId" clearable>
          <el-option v-for="teacher in teachers" :key="teacher.teacherId" :label="teacher.name" :value="teacher.teacherId"></el-option>
        </el-select>
      </div>
      <div class="item">
        <label>课程</label>
        <el-select size="small" placeholder="请选择课程" v-model="query.courseId" filterable remote :remote-method="searchCourse" :loading="seachingCourse" clearable>
          <el-option v-for="course in courses" :key="course.courseId" :label="course.name" :value="course.courseId"></el-option>
        </el-select>
      </div>
      <el-button size="small" @click="load(1)">查询</el-button>
    </div>
    <train-chart ref="trainChart" style="margin:20px auto;"></train-chart>
    <el-table :data="trains" :stripe="true" size="mini" border v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="startTime" label="上课时间" :formatter="timeFormatter" width="175px"></el-table-column>
      <el-table-column prop="courseName" label="课程"></el-table-column>
      <el-table-column prop="schoolName" label="学校"></el-table-column>
      <el-table-column prop="clazzName" label="班级" width="120px">
        <template slot-scope="scope">{{getClazzLabel(scope.row.clazzGrade, scope.row.clazzName)}}</template>
      </el-table-column>
      <el-table-column prop="teacherName" label="老师" width="90px" v-if="!admin.teacherId"></el-table-column>
      <el-table-column prop="studentCount" label="学生" :formatter="studentCountFormatter" width="110px"></el-table-column>
      <el-table-column prop="courseItemCount" label="完课情况" :formatter="courseFormatter" width="110px"></el-table-column>
      <el-table-column fixed="right" label="操作" width="90">
        <template slot-scope="scope">
          <el-button @click="toView(scope.row)" type="text" size="small">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="loadPage" class="app-pagination"></el-pagination>

    <el-dialog title="学生训练详情" :visible.sync="showStudentDataDialog" width="96%" append-to-body>
      <train-student-list :schoolId="training.schoolId" :trainingId="training.trainingId"></train-student-list>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { DICTIONARY_ID_GRADE } from '@/config'
import { formatDate } from '@/util'
import TrainStudentList from './TrainStudentList'
import TrainChart from './TrainChart'

export default {
  name: 'train-list',
  components: {
    TrainStudentList,
    TrainChart
  },
  data () {
    return {
      loading: false,
      trains: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        dates: [],
        schoolId: null,
        clazzId: null,
        teacherId: null,
        courseId: null
      },
      seachingSchool: false,
      schools: [],
      clazzs: [],
      teachers: [],
      seachingCourse: false,
      courses: [],
      grades: [],
      schoolClazzMap: {},
      schoolTeacherMap: {},
      training: {},
      showStudentDataDialog: false
    }
  },
  computed: {
    admin () {
      return this.$store.state.admin
    },
    schoolId () {
      return this.admin.schoolId || this.query.schoolId
    },
    teacherId () {
      return this.admin.teacherId || this.query.teacherId
    }
  },
  created () {
    Vue.biz.loadDictionary(DICTIONARY_ID_GRADE, (grades) => {
      this.grades = grades
      this.load(1)
    })

    if (this.schoolId) {
      this.loadClazz()
      if (!this.teacherId) {
        this.loadTeacher()
      }
    } else {
      this.searchSchool()
    }
    this.searchCourse()
  },
  methods: {
    load (page, isPaging) {
      let dates = this.query.dates || []
      let startDate = dates[0] || ''
      if (startDate) {
        startDate = `${formatDate(startDate)} 00:00:00`
      }
      let endDate = dates[1] || ''
      if (endDate) {
        endDate = `${formatDate(endDate)} 23:59:59`
      }

      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/trains?page=${page}&limit=${this.query.limit}&schoolId=${this.schoolId || ''}&clazzId=${this.query.clazzId || ''}&teacherId=${this.teacherId || ''}&courseId=${this.query.courseId || ''}&startDate=${startDate}&endDate=${endDate}`
      }).then((res) => {
        let pageData = res.data.data
        this.trains = pageData.data
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })

      if (isPaging !== true) {
        this.$http.request({
          method: 'get',
          url: `/web/api/trains/stats?schoolId=${this.schoolId || ''}&clazzId=${this.query.clazzId || ''}&teacherId=${this.teacherId || ''}&courseId=${this.query.courseId || ''}&startDate=${startDate}&endDate=${endDate}`
        }).then((res) => {
          let stat = res.data.data || {}
          this.$refs.trainChart.renderChart(stat.dayCounts || [], stat.dayCourseItemCompleteRates || [], stat.dayAvgHeartRates || [])
        })
      }
    },
    loadPage (page) {
      this.load(page, true)
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
    onSchoolChange () {
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
        url: `/web/api/clazzs?page=1&limit=99999999&schoolId=${schoolId}&teacherId=${this.admin.teacherId || ''}`
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
    searchCourse (query) {
      this.seachingCourse = true
      this.$http.request({
        method: 'get',
        url: `/web/api/courses?page=1&limit=10&name=${query || ''}`
      }).then((res) => {
        this.courses = res.data.data.data
        this.seachingCourse = false
      }).catch(() => {
        this.seachingCourse = false
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
    timeFormatter (row) {
      return `${row.startTime.substring(0, 16)} ~ ${row.endTime.substring(10, 16)}`
    },
    studentCountFormatter (row) {
      return `${row.trainingStudentCount} / ${row.clazzStudentCount}`
    },
    courseFormatter (row) {
      return `${(row.courseItemPositions || []).length} / ${row.courseItemCount || 0}`
    },
    toView (row) {
      this.training = row
      this.showStudentDataDialog = true
    }
  }
}
</script>
