<template>
  <div>
    <app-header></app-header>
    <app-body></app-body>

    <el-dialog :title="confirmParam.title" :visible.sync="showConfirm" width="30%" append-to-body @close="onConfirmClose">
      <span>{{confirmParam.msg}}</span>
      <span slot="footer">
        <el-button @click="onConfirm(false)">取 消</el-button>
        <el-button @click="onConfirm(true)" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader'
import AppBody from './components/AppBody'

export default {
  name: 'app',
  components: {
    AppHeader,
    AppBody
  },
  data () {
    return {
      showConfirm: false,
      emitConfrimClose: true,
      confirmParam: {}
    }
  },
  created () {
    this.bindGlobalEvent()
  },
  methods: {
    bindGlobalEvent () {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'confirm') {
          this.confirmParam = state.confirm
          this.showConfirm = !!state.confirm && !!state.confirm.title
          this.emitConfrimClose = true
        }
      })
    },
    onConfirm (result) {
      this.showConfirm = false
      this.emitConfrimClose = false
      this.confirmParam.callback.apply(this.confirmParam.scope || null, [result, this.confirmParam.data])
    },
    onConfirmClose () {
      if (!this.emitConfrimClose) {
        this.emitConfrimClose = true
        return
      }
      if (this.confirmParam.close) {
        this.confirmParam.close.apply(this.confirmParam.scope || null, [this.confirmParam.data])
      }
    }
  }
}
</script>

<style>
*{font-family:'PingFangSC-Regular';}
html, body {background-color:#fff;margin:0;padding:0;}

.app-content{height:calc(100% - 52px);overflow-y:scroll;}
.app-toolbar{width:100%;box-sizing:border-box;padding:12px 10px;border-bottom:1px solid #e4e7ed;text-align:right;}
.app-toolbar>label{font-size:14px;margin-left:30px !important;color:#58595F;}
.app-toolbar>.el-input{margin-left:10px !important;width:200px !important;}
.app-toolbar>.el-select{margin-left:10px !important;width:200px !important;}
.app-toolbar>.el-input-number{margin-left:10px !important;width:200px !important;}
.app-toolbar>.el-date-editor{margin-left:10px !important;}
.app-toolbar>.el-button{margin-left:10px !important;}
.app-toolbar>.left{margin-right:10px !important;float:left;}
.app-pagination{text-align:right;margin:16px 0 0;}
.el-pagination{margin:16px 0 10px;text-align:right;padding-right:0;}
</style>
