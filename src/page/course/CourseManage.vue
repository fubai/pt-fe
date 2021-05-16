<template>
  <div class="app-content">
    <div class="app-toolbar">
      <el-input size="small" placeholder="请输入关键字" v-model="query.name" clearable style="width:360px">
        <el-button size="small" @click="load(1)" slot="append">查询</el-button>
      </el-input>
      <el-button size="small" icon="el-icon-plus" @click="toAdd" type="primary">添加课程</el-button>
    </div>
    <el-table :data="courses" :stripe="true" size="mini" v-loading="loading">
      <el-table-column prop="name" label="课程名称"></el-table-column>
      <el-table-column prop="desc" label="课程描述" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="durationText" label="课程时长" width="80px"></el-table-column>
      <el-table-column prop="items" label="课程环节" width="80px">
        <template slot-scope="scope">
          <el-popover title="课程环节" width="360" trigger="hover" placement="right">
            <el-table :data="scope.row.items" :stripe="true" border size="mini">
              <el-table-column type="index" label="序号"></el-table-column>
              <el-table-column prop="durationText" label="环节时长"></el-table-column>
              <el-table-column prop="contentName" label="训练内容"></el-table-column>
            </el-table>
            <el-button type="text" slot="reference">{{scope.row.items.length}}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="145px" sortable></el-table-column>
      <el-table-column prop="updateTime" label="最后更新时间" width="145px" sortable></el-table-column>
      <el-table-column fixed="right" label="操作" width="158">
        <template slot-scope="scope">
          <el-button @click="toUpdate(scope.row)" type="primary" size="small" v-if="hasPermission(scope.row)">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small" v-if="hasPermission(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="load" class="app-pagination"></el-pagination>

    <el-dialog :title="formTitle" :visible.sync="showForm" :append-to-body="true" :closeOnClickModal="false" width="580px">
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-width="80px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入课程名称"></el-input>
        </el-form-item>
        <el-form-item label="课程描述" prop="desc">
          <el-input v-model="form.desc" placeholder="请输入课程描述"></el-input>
        </el-form-item>
      </el-form>

      <el-table :data="form.items" row-key="key" :stripe="true" border>
        <el-table-column prop="content" label="训练内容">
          <template slot-scope="scope">
            <el-select v-model="scope.row.content" placeholder="请选择训练内容" size="mini" style="width:200px">
              <el-option v-for="trainingItem in trainingItems" :key="trainingItem.key" :label="trainingItem.label" :value="trainingItem.key"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="minute" label="时长(分钟)">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.minute" placeholder="请输入环节时长(分钟)" size="mini" style="width:200px"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="78">
          <template slot-scope="scope">
            <el-button @click="toDeleteItem(scope.$index)" type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button @click="toAddItem" style="float:left">添加环节</el-button>
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="doSave">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { calcPage } from '@/util'
import { DICTIONARY_ID_TRAIN } from '@/config'

export default {
  name: 'course-manage',
  data () {
    return {
      trainingItems: [],
      loading: false,
      courses: [],
      query: {
        page: 1,
        limit: 10,
        total: 0,
        name: null
      },
      showForm: false,
      formTitle: '添加课程',
      form: {
        name: '',
        desc: '',
        items: []
      },
      formRule: {
        name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
        desc: [{ required: true, message: '请输入课程描述', trigger: 'blur' }]
      },
      currentUpdateCourseId: 0
    }
  },
  computed: {
    admin () {
      return this.$store.state.admin
    },
    schoolId () {
      return this.admin.schoolId
    },
    teacherId () {
      return this.admin.teacherId
    }
  },
  created () {
    Vue.biz.loadDictionary(DICTIONARY_ID_TRAIN, (trainingItems) => {
      this.trainingItems = trainingItems
      this.load(1)
    })
  },
  methods: {
    load (page) {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/courses?page=${page}&limit=${this.query.limit}&name=${this.query.name || ''}`
      }).then((res) => {
        let pageData = res.data.data
        let courses = pageData.data
        for (let i = courses.length - 1; i >= 0; i--) {
          this.fill(courses[i])
        }
        this.courses = courses
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    toAdd () {
      this.formTitle = '添加课程'
      this.form = { name: '', desc: '', items: [] }
      this.currentUpdateCourseId = 0
      this.showForm = true
    },
    toUpdate (row) {
      this.formTitle = '修改课程'
      this.form = { name: row.name, desc: row.desc, items: row.items || [] }
      this.currentUpdateCourseId = row.courseId
      this.showForm = true
    },
    toDelete (row) {
      this.$store.commit('confirm', { title: '提示', msg: '您确认要删除该课程吗?', data: row, scope: this, callback: this.doDelete })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let courseId = this.currentUpdateCourseId
          let items = this.form.items || []
          let itemList = []
          for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let minute = item.minute
            if (!minute) {
              return
            }
            let content = item.content
            if (!content) {
              return
            }
            item.duration = minute * 60
            itemList.push({
              duration: item.duration,
              content: item.content
            })
          }

          this.$http.request({
            method: courseId === 0 ? 'post' : 'put',
            url: courseId === 0 ? '/web/api/courses' : `/web/api/courses/${courseId}`,
            data: JSON.stringify({
              name: this.form.name,
              desc: this.form.desc || null,
              items: itemList
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
    doDelete (result, data) {
      if (result) {
        this.$http.request({
          method: 'delete',
          url: `/web/api/courses/${data.courseId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load(calcPage(this.query))
        })
      }
    },
    toAddItem () {
      this.form.items.push({
        key: `${Math.random()}`
      })
    },
    toDeleteItem (index) {
      this.form.items.splice(index, 1)
    },
    fill (course) {
      course.items = course.items || []

      let duration = 0
      let items = course.items
      for (let i = 0; i < items.length; i++) {
        let item = items[i]
        duration += item.duration

        item.minute = parseInt(item.duration / 60, 10)
        item.durationText = this.getDurationText(item.duration)
        item.contentName = this.getContentName(item.content)
        item.key = `${Math.random()}`
      }
      course.duration = duration
      course.durationText = this.getDurationText(duration)
    },
    getDurationText (duration) {
      let second = duration || 0
      let minute = second / 60
      second = second % 60
      if (second == 0) {
        return `${minute}分钟`
      } else {
        return `${minute}分钟${second}秒`
      }
    },
    getContentName (content) {
      for (let i = 0; i < this.trainingItems.length; i++) {
        let trainingItem = this.trainingItems[i]
        if (trainingItem.key === content) {
          return trainingItem.label
        }
      }
      return content
    },
    hasPermission (row) {
      if (!this.schoolId && !this.teacherId) {
        return true
      }
      if (this.teacherId) {
        return row.teacherId === this.teacherId
      }
      if (this.schoolId) {
        return row.schoolId === this.schoolId
      }
      return false
    }
  }
}
</script>
