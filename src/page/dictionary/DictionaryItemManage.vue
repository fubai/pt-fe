<template>
  <div>
    <div class="app-toolbar" style="padding-bottom:12px;">
      <el-button size="mini" @click="toAdd" type="primary">添加字典项</el-button>
    </div>
    <el-table :data="dictionaryItems" :stripe="true" size="mini" border v-loading="loading">
      <el-table-column prop="orderNo" label="序号"></el-table-column>
      <el-table-column prop="parentKey" label="父键"></el-table-column>
      <el-table-column prop="key" label="键"></el-table-column>
      <el-table-column prop="label" label="文本"></el-table-column>
      <el-table-column fixed="right" label="操作" width="145">
        <template slot-scope="scope">
          <el-button @click="toUpdate(scope.row)" type="primary" size="mini" v-if="!!dictionaryId">修改</el-button>
          <el-button @click="toDelete(scope.row)" type="danger" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="formTitle" :visible.sync="showForm" @open="onOpenDialog" :append-to-body="true" :closeOnClickModal="false">
      <el-form :model="form" :rules="formRule" ref="form" :status-icon="true" label-position="top" size="mini">
        <el-form-item label="序号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="序号" ref="orderNo"></el-input>
        </el-form-item>
        <el-form-item label="父键" prop="parentKey">
          <el-input v-model="form.parentKey" placeholder="请输入父键"></el-input>
        </el-form-item>
        <el-form-item label="键" prop="key">
          <el-input v-model="form.key" placeholder="请输入键"></el-input>
        </el-form-item>
        <el-form-item label="文本" prop="label">
          <el-input v-model="form.label" placeholder="请输入文本" ref="label"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="showForm = false">关 闭</el-button>
        <el-button size="mini" type="primary" @click="doSave(true)">保存并关闭</el-button>
        <el-button size="mini" type="primary" @click="doSave(false)" v-if="!this.form.dictionaryItemId">保存并继续</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'dictionary-item-manage',
  props: {
    dictionaryId: { type: Number, required: false },
    keyType: String
  },
  data (me) {
    return {
      loading: false,
      dictionaryItems: [],
      showForm: false,
      formTitle: '添加字典项',
      form: {
        dictionaryItemId: 0,
        parentKey: '',
        key: '',
        label: '',
        orderNo: ''
      },
      formRule: {
        parentKey: [{
          trigger: 'blur',
          validator: function (rule, value, callback) {
            if (value && me.keyType === 'INTEGER' && !/^-?[1-9]\d*$/.test(value)) {
              callback(new Error('键值必须是数字类型'))
            } else {
              callback()
            }
          }
        }],
        key: [{
          trigger: 'blur',
          validator: function (rule, value, callback) {
            if (!value) {
              callback(new Error('请输入键'))
            } else if (me.keyType === 'INTEGER' && !/^-?[1-9]\d*$/.test(value)) {
              callback(new Error('键值必须是数字类型'))
            } else {
              callback()
            }
          }
        }],
        label: [{ required: true, message: '请输入文本', trigger: 'blur' }],
        orderNo: [{ required: true, message: '请输入序号', trigger: 'blur' }]
      },
      dialogOpened: false
    }
  },
  created () {
    this.load()
  },
  watch: {
    dictionaryId () {
      this.load()
    }
  },
  methods: {
    load () {
      let dictionaryId = this.dictionaryId
      if (!dictionaryId) {
        this.dictionaryItems = []
        return
      }

      this.loading = true
      this.$http.request({
        method: 'get',
        url: `/web/api/dictionaries/${dictionaryId}/items`
      }).then((res) => {
        this.dictionaryItems = res.data.data
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    toAdd () {
      this.formTitle = '添加字典项'
      this.form = { dictionaryItemId: 0, parentKey: '', key: '', label: '', orderNo: '' }
      this.showForm = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    toUpdate (row) {
      this.formTitle = '修改字典项'
      this.form = { dictionaryItemId: row.dictionaryItemId, parentKey: row.parentKey, key: row.key, label: row.label, orderNo: row.orderNo }
      this.showForm = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    toDelete (row) {
      if (row.dictionaryItemId) {
        this.$store.commit('confirm', { title: '提示', msg: '您确认要删除该字典项吗?', data: row, scope: this, callback: this.doDelete })
      } else {
        let dictionaryItems = this.dictionaryItems
        for (let i = 0; i < dictionaryItems.length; i++) {
          if (row === dictionaryItems[i]) {
            dictionaryItems.splice(i, 1)
            return
          }
        }
      }
    },
    doSave (close) {
      this.$refs.form.validate((success) => {
        if (success) {
          let dictionaryId = this.dictionaryId
          if (dictionaryId) {
            let dictionaryItemId = this.form.dictionaryItemId
            this.$http.request({
              method: dictionaryItemId === 0 ? 'post' : 'put',
              url: dictionaryItemId === 0 ? `/web/api/dictionaries/${dictionaryId}/items` : `/web/api/dictionaries/${dictionaryId}/items/${dictionaryItemId}`,
              data: JSON.stringify({
                parentKey: this.form.parentKey,
                key: this.form.key,
                label: this.form.label,
                orderNo: this.form.orderNo
              })
            }).then(() => {
              if (close) {
                this.showForm = false
              } else {
                if (!dictionaryItemId) {
                  this.form = { dictionaryItemId: 0, parentKey: '', key: '', label: '', orderNo: '' }
                  this.$refs.form.clearValidate()
                  this.$refs.orderNo.focus()
                }
              }
              this.load()
            })
          } else {
            this.dictionaryItems.push({ parentKey: this.form.parentKey, key: this.form.key, label: this.form.label, orderNo: this.form.orderNo })
            if (close) {
              this.showForm = false
            } else {
              this.form = { dictionaryItemId: 0, parentKey: '', key: '', label: '', orderNo: '' }
              this.$refs.form.clearValidate()
              this.$refs.orderNo.focus()
            }
          }
        } else {
          return false
        }
      })
    },
    doDelete (result, data) {
      if (result) {
        this.$http.request({
          method: 'delete',
          url: `/web/api/dictionaries/${this.dictionaryId}/items/${data.dictionaryItemId}`
        }).then(() => {
          this.$message.success('删除成功')
          this.load()
        })
      }
    },
    getItems () {
      return this.dictionaryItems
    },
    onOpenDialog () {
      let me = this
      if (me.dialogOpened) {
        return
      }
      me.dialogOpened = true

      Vue.nextTick(() => {
        me.$refs.label.$refs.input.onkeydown = function (e) {
          let keyCode = e.keyCode
          if (keyCode === 9) {
            // tab -> 保存并继续
            e.preventDefault()
            me.doSave(!!me.form.dictionaryItemId)
          } else if (keyCode === 13) {
            // enter -> 保存并关闭
            e.preventDefault()
            me.doSave(true)
          }
        }
      })
    }
  }
}
</script>
