<template>
  <div>
    <div class="app-toolbar">
      <el-input size="small" placeholder="请输入关键字" v-model="query.name" clearable style="width:360px">
        <el-button size="small" @click="load" slot="append">查询</el-button>
      </el-input>
      <el-button size="small" icon="el-icon-plus" @click="toAdd" type="primary">添加</el-button>
    </div>
    <el-table :data="dictionaries" :stripe="true" size="mini" v-loading="loading">
      <el-table-column prop="dictionaryId" label="ID"></el-table-column>
      <el-table-column prop="keyType" label="键的类型"></el-table-column>
      <el-table-column prop="name" label="字典名称" sortable></el-table-column>
      <el-table-column prop="desc" label="字典描述" sortable :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" sortable></el-table-column>
      <el-table-column prop="updateTime" label="最后更新时间" sortable></el-table-column>
      <el-table-column fixed="right" label="操作" width="228">
        <template slot-scope="scope">
          <el-button @click="toUpdate(scope.row)" type="primary" size="small">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="small">删除</el-button>
          <el-button @click="viewItem(scope.row)" type="default" size="small">字典项</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="formTitle" :visible.sync="showForm" :append-to-body="true" :closeOnClickModal="false">
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top" size="mini">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="form.desc" placeholder="请输入字典描述" type="textarea"></el-input>
        </el-form-item>
        <el-form-item :label="'键的类型' + (form.keyType === 'STRING' ? '（字符串类型）' : '（整数类型）')" prop="keyType">
          <el-radio-group v-model="form.keyType" :disabled="!!form.dictionaryId">
            <el-radio-button label="STRING">字符串类型</el-radio-button>
            <el-radio-button label="INTEGER">整数类型</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <dictionary-item-manage :dictionaryId="form.dictionaryId" :keyType="form.keyType" ref="dictionaryItemManage"></dictionary-item-manage>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="showForm = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="doSave">保 存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="字典项" :visible.sync="showItem" :append-to-body="true" :closeOnClickModal="false">
      <dictionary-item-manage :dictionaryId="parentDictionaryId" :keyType="form.keyType"></dictionary-item-manage>
    </el-dialog>
  </div>
</template>

<script>
import DictionaryItemManage from './DictionaryItemManage'

export default {
  name: 'dictionary-manage',
  components: {
    DictionaryItemManage
  },
  data () {
    return {
      loading: false,
      dictionaries: [],
      query: {
        name: null
      },
      showForm: false,
      formTitle: '添加字典',
      form: {
        dictionaryId: 0,
        name: '',
        desc: '',
        keyType: 'STRING'
      },
      formRule: {
        name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }]
      },
      showItem: false,
      parentDictionaryId: null
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      this.loading = true
      this.$http.request({
        method: 'get',
        url: this.query.name ? `/web/api/dictionaries?name=${this.query.name}` : '/web/api/dictionaries'
      }).then((res) => {
        this.dictionaries = res.data.data
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    toAdd () {
      this.formTitle = '添加字典'
      this.form = { dictionaryId: 0, name: '', desc: '', keyType: 'STRING' }
      this.showForm = true
      this.$nextTick(() => {
        this.$refs.dictionaryItemManage.dictionaryItems = []
      })
    },
    toUpdate (row) {
      this.formTitle = '修改字典'
      this.form = { dictionaryId: row.dictionaryId, name: row.name, desc: row.desc, keyType: row.keyType }
      this.showForm = true
    },
    toDelete (row) {
      this.$store.commit('confirm', { title: '提示', msg: '您确认要删除该字典吗?', data: row, scope: this, callback: this.doDelete })
    },
    viewItem (row) {
      this.parentDictionaryId = row.dictionaryId
      this.showItem = true
    },
    doSave () {
      this.$refs.form.validate((success) => {
        if (success) {
          let dictionaryId = this.form.dictionaryId
          this.$http.request({
            method: dictionaryId === 0 ? 'post' : 'put',
            url: dictionaryId === 0 ? '/web/api/dictionaries' : `/web/api/dictionaries/${dictionaryId}`,
            data: JSON.stringify({
              name: this.form.name,
              desc: this.form.desc,
              keyType: this.form.keyType,
              items: dictionaryId === 0 ? this.$refs.dictionaryItemManage.getItems() : null
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
    doDelete (result, data) {
      if (result) {
        this.$http.request({
          method: 'delete',
          url: `/web/api/dictionaries/${data.dictionaryId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load()
        })
      }
    }
  }
}
</script>
