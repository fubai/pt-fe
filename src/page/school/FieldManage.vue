<template>
  <div class="app-content">
    <div class="app-toolbar">
      <div class="item left">
        <el-button size="small" @click="toAdd" type="primary">添加场地</el-button>
      </div>
      <div class="item" v-if="!schoolId">
        <label>学校</label>
        <el-select size="small" placeholder="请选择学校" v-model="query.schoolId" filterable remote :remote-method="searchSchool1" :loading="seachingSchool1" clearable style="width:100%">
          <el-option v-for="school in schools1" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
        </el-select>
      </div>
      <div class="item">
        <label>场地名称</label>
        <el-input size="small" placeholder="请输入场地名称" v-model="query.name" clearable></el-input>
      </div>
      <el-button size="small" @click="load(1)">查询</el-button>
    </div>
    <el-table :data="fields" :stripe="true" size="mini" v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="schoolName" label="学校"></el-table-column>
      <el-table-column prop="name" label="场地"></el-table-column>
      <el-table-column prop="bluetoothGatewayMac" label="蓝牙网关MAC地址" width="120px"></el-table-column>
      <el-table-column prop="bgImageUrl" label="背景图"></el-table-column>
      <el-table-column prop="equipmentCount" label="设备数量" width="80px">
        <template slot-scope="scope">
          <el-link @click="toManageEquipment(scope.row)" type="primary" size="small">{{scope.row.equipmentCount}}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="145px"></el-table-column>
      <el-table-column prop="updateTime" label="最后修改时间" width="145px"></el-table-column>
      <el-table-column fixed="right" label="操作" width="238">
        <template slot-scope="scope">
          <el-button @click="toManageEquipment(scope.row)" type="primary" size="small">设备管理</el-button>
          <el-button @click="toUpdate(scope.row)" type="primary" size="small">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="query.total > 0" :page-size="query.limit" :pager-count="11" layout="total, prev, pager, next" :total="query.total" :background="true" :current-page="query.page" @current-change="load" class="app-pagination"></el-pagination>

    <el-dialog :title="formTitle" :visible.sync="showForm" append-to-body>
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top">
        <el-form-item label="学校" prop="schoolId" v-if="!schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" filterable remote :remote-method="searchSchool2" :loading="seachingSchool2" style="width:100%" :disabled="!!currentUpdateFieldId">
            <el-option v-for="school in schools2" :key="school.schoolId" :label="school.name" :value="school.schoolId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="场地" prop="name">
          <el-input v-model="form.name" placeholder="请输入场地名称"></el-input>
        </el-form-item>
        <el-form-item label="蓝牙网关MAC地址" prop="bluetoothGatewayMac">
          <el-input v-model="form.bluetoothGatewayMac" placeholder="请输入蓝牙网关MAC地址"></el-input>
        </el-form-item>
        <el-form-item label="背景图" prop="bgImageUrl">
          <el-input v-model="form.bgImageUrl" placeholder="请输入背景图地址" :maxlength="200"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" @click="doSave">保 存</el-button>
      </div>
    </el-dialog>

    <equipment-manage ref="equipmentManage"></equipment-manage>
  </div>
</template>

<script>
import { calcPage } from '@/util'
import EquipmentManage from './EquipmentManage'

export default {
  name: 'field-manage',
  components: {
    EquipmentManage
  },
  data () {
    return {
      loading: false,
      fields: [],
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
      showForm: false,
      formTitle: '添加场地',
      form: {
        schoolId: null,
        name: '',
        bluetoothGatewayMac: '',
        bgImageUrl: ''
      },
      formRule: {
        schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }],
        name: [
          { required: true, message: '请输入场地名称', trigger: 'blur' },
          { max: 15, message: '最多15个字符', trigger: 'blur' }
        ],
        bluetoothGatewayMac: [
          { required: true, message: '请输入蓝牙网关MAC地址', trigger: 'blur' },
          { min: 12, max: 12, message: '长度是12个字符', trigger: 'blur' }
        ]
      },
      currentUpdateFieldId: 0
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
    this.load(1)
    if (!this.schoolId) {
      this.searchSchool1()
    }
  },
  methods: {
    load (page) {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/fields?page=${page}&limit=${this.query.limit}&name=${this.query.name || ''}&schoolId=${this.schoolId || this.query.schoolId || ''}`
      }).then((res) => {
        let pageData = res.data.data
        this.fields = pageData.data
        this.query.page = pageData.page
        this.query.total = pageData.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
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
    toAdd () {
      if (this.schoolId) {
        this.toAdd1()
      } else {
        this.searchSchool2('', () => {
          this.toAdd1()
        })
      }
    },
    toAdd1 () {
      this.formTitle = '添加场地'
      this.currentUpdateFieldId = 0
      this.form = {
        schoolId: this.schoolId,
        name: '',
        bluetoothGatewayMac: '',
        bgImageUrl: ''
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toUpdate (row) {
      this.schools2 = [{ schoolId: row.schoolId, name: row.schoolName }]
      this.formTitle = '修改场地'
      this.currentUpdateFieldId = row.fieldId
      this.form = {
        schoolId: row.schoolId,
        name: row.name,
        bluetoothGatewayMac: row.bluetoothGatewayMac,
        bgImageUrl: row.bgImageUrl
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.showForm = true
    },
    toDelete (row) {
      this.$confirm('您确认要删除该场地吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.request({
          method: 'delete',
          url: `/web/api/fields/${row.fieldId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load(calcPage(this.query))
        })
      })
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let fieldId = this.currentUpdateFieldId
          this.$http.request({
            method: fieldId === 0 ? 'post' : 'put',
            url: fieldId === 0 ? '/web/api/fields' : `/web/api/fields/${fieldId}`,
            data: JSON.stringify({
              schoolId: this.form.schoolId,
              name: this.form.name,
              bluetoothGatewayMac: this.form.bluetoothGatewayMac,
              bgImageUrl: this.form.bgImageUrl
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
    toManageEquipment (field) {
      this.$refs.equipmentManage.open(field)
    }
  }
}
</script>
