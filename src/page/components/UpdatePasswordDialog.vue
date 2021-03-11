<template>
  <el-dialog title="重置密码" :visible.sync="show" @close="reset" append-to-body>
    <el-form :model="form" :rules="formRule" ref="form" :status-icon="true">
      <el-form-item label="原密码" prop="password">
        <el-input v-model="form.password" placeholder="请输入密码，不少于6位" type="password" :maxlength="40"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" placeholder="请输入密码，不少于6位" type="password" :maxlength="40"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="newPassword2">
        <el-input v-model="form.newPassword2" placeholder="请再次输入新登录密码" type="password" :maxlength="40"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="show = false">取 消</el-button>
      <el-button type="primary" @click="save" :loading="loading">重置密码</el-button>
    </div>
  </el-dialog>
</template>

<script>
import md5 from 'js-md5'

export default {
  name: 'update-password-dialog',
  data () {
    return {
      show: false,
      form: {
        password: '',
        newPassword: '',
        newPassword2: ''
      },
      formRule: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '不少于6位', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '不少于6位', trigger: 'blur' }
        ],
        newPassword2: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '不少于6位', trigger: 'blur' },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请再次输入新登录密码'))
              } else if (value !== this.form.newPassword) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      loading: false
    }
  },
  methods: {
    open () {
      this.show = true
    },
    save () {
      this.$refs.form.validate((success) => {
        if (success) {
          this.loading = true
          let { password, newPassword, newPassword2 } = this.form
          this.$http.request({
            method: 'put',
            url: '/web/api/admins/password',
            data: JSON.stringify({
              password: md5(password),
              newPassword: md5(newPassword),
              newPassword2: md5(newPassword2)
            })
          }).then(() => {
            this.loading = false
            this.show = false
            this.$message.success('重置成功')
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    reset () {
      this.form = { password: '', newPassword: '', newPassword2: '' }
    }
  }
}
</script>
