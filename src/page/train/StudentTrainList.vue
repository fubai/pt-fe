<template>
  <div v-loading="loading">
    <el-table :data="trains" :stripe="true" size="mini" border @row-click="openDrawer">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="startTime" label="上课时间" :formatter="timeFormatter" width="175px"></el-table-column>
      <el-table-column prop="courseName" label="课程"></el-table-column>
      <el-table-column prop="clazzName" label="班级" width="120px">
        <template slot-scope="scope">{{getClazzLabel(scope.row.clazzGrade, scope.row.clazzName)}}</template>
      </el-table-column>
      <el-table-column prop="teacherName" label="老师" width="90px"></el-table-column>
      <el-table-column prop="courseItemCount" label="完课情况" :formatter="courseFormatter" width="110px"></el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="load" class="app-pagination"></el-pagination>
    <student-train-drawer ref="studentTrainDrawer" :show-bottom="false"></student-train-drawer>
  </div>
</template>

<script>
import Vue from 'vue'
import { DICTIONARY_ID_GRADE } from '@/config'

export default {
  name: 'student-train-list',
  props: {
    studentId: {type: Number, require: true}
  },
  data () {
    return {
      loading: false,
      trains: [],
      query: {
        page: 1,
        limit: 10,
        total: 0
      },
      grades: []
    }
  },
  watch: {
    trainingId: {
      handler: function () {
        this.load(1)
      },
      immediate: true
    }
  },
  created () {
    Vue.biz.loadDictionary(DICTIONARY_ID_GRADE, (grades) => {
      this.grades = grades
      this.load(1)
    })
  },
  methods: {
    load (page) {
      if (!this.studentId) {
        this.trains = []
        this.query.page = 1
        this.query.total = 0
        return
      }

      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/students/${this.studentId}/trainings?page=${page}&limit=${this.query.limit}`
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
    courseFormatter (row) {
      return `${(row.courseItemPositions || []).length} / ${row.courseItemCount || 0}`
    },
    openDrawer (row) {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/trains/${row.trainingId}/stats?studentId=${this.studentId}`
      }).then((res) => {
        this.loading = false

        let stats = res.data.data || []
        this.$refs.studentTrainDrawer.open(stats[0])
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>
