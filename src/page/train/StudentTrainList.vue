<template>
  <el-dialog :title="stat.studentName" :visible.sync="show" width="80%" append-to-body>
    <div v-loading="loading">
      <div class="app-toolbar" style="border-bottom:none;padding-right:0">
        <div class="item">
          <label>训练日期</label>
          <el-date-picker v-model="query.dates" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:270px;"></el-date-picker>
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
      <el-table :data="trains" :stripe="true" size="mini" @row-click="openDrawer" border :row-style="{ cursor: 'pointer' }">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="startTime" label="上课时间" :formatter="timeFormatter" width="175px"></el-table-column>
        <el-table-column prop="courseName" label="课程"></el-table-column>
        <el-table-column prop="clazzName" label="班级" width="120px">
          <template slot-scope="scope">{{getClazzLabel(scope.row.clazzGrade, scope.row.clazzName)}}</template>
        </el-table-column>
        <el-table-column prop="teacherName" label="老师" width="90px" v-if="!admin.teacherId"></el-table-column>
        <el-table-column prop="courseItemCount" label="完课情况" :formatter="courseFormatter" width="110px"></el-table-column>
      </el-table>
      <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="loadPage" class="app-pagination"></el-pagination>
      <student-train-drawer ref="studentTrainDrawer" :show-bottom="false"></student-train-drawer>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { DICTIONARY_ID_GRADE } from '@/config'
import { formatDate, formatTimestamp } from '@/util'
import TrainChart from './TrainChart'

export default {
  name: 'student-train-list',
  components: {
    TrainChart
  },
  data () {
    return {
      schoolId: null,
      stat: {},
      show: false,
      loading: false,
      trains: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        dates: [],
        teacherId: null,
        courseId: null
      },
      teachers: [],
      seachingCourse: false,
      courses: [],
      grades: []
    }
  },
  computed: {
    admin () {
      return this.$store.state.admin
    }
  },
  created () {
    Vue.biz.loadDictionary(DICTIONARY_ID_GRADE, (grades) => {
      this.grades = grades
    })
    this.searchCourse()
  },
  methods: {
    open (schoolId, stat) {
      this.schoolId = schoolId
      this.stat = stat
      this.show = true
      this.loadTeacher()
      this.load(1)
    },
    load (page, isPaging) {
      if (!this.stat || !this.stat.studentId) {
        this.trains = []
        this.query.page = 1
        this.query.total = 0
        return
      }

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
        url: `/web/api/students/${this.stat.studentId}/trainings?teacherId=${this.query.teacherId || ''}&courseId=${this.query.courseId || ''}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${this.query.limit}`
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
          url: `/web/api/trainings/stats?schoolId=${this.schoolId || ''}&clazzId=${this.query.clazzId || ''}&teacherId=${this.query.teacherId || ''}&courseId=${this.query.courseId || ''}&studentId=${this.stat.studentId}&startDate=${startDate}&endDate=${endDate}`
        }).then((res) => {
          let stat = res.data.data || {}
          this.$refs.trainChart.renderChart(stat.dayCounts || [], stat.dayCourseItemCompleteRates || [], stat.dayAvgHeartRates || [])
        })
      }
    },
    loadPage (page) {
      this.load(page, true)
    },
    loadTeacher () {
      let schoolId = this.schoolId
      if (!schoolId) {
        this.teachers = []
        return
      }

      this.$http.request({
        method: 'get',
        url: `/web/api/teachers?page=1&limit=99999999&schoolId=${schoolId}`
      }).then((res) => {
        this.teachers = res.data.data.data
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
      let startTime = formatTimestamp(new Date(row.startTime * 1000))
      let endTime = formatTimestamp(new Date(row.endTime * 1000))
      return `${startTime.substring(0, 16)} ~ ${endTime.substring(10, 16)}`
    },
    courseFormatter (row) {
      return `${(row.courseItemPositions || []).length} / ${row.courseItemCount || 0}`
    },
    openDrawer (row) {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/trainings/${row.trainingId}/stats?studentId=${this.stat.studentId}`
      }).then((res) => {
        this.loading = false

        let stats = res.data.data || []
        this.$refs.studentTrainDrawer.open(stats[0], stats[0].schoolId)
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>
