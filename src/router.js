import Vue from 'vue'
import Router from 'vue-router'
import ApiManage from './page/system/ApiManage'
import MenuManage from './page/system/MenuManage'
import RoleManage from './page/system/RoleManage'
import AdminManage from './page/system/AdminManage'
import DictionaryManage from './page/dictionary/DictionaryManage'
import SchoolManage from './page/school/SchoolManage'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/system/api-manage', component: ApiManage },
    { path: '/system/menu-manage', component: MenuManage },
    { path: '/system/role-manage', component: RoleManage },
    { path: '/system/admin-manage', component: AdminManage },
    { path: '/system/dictionary-manage', component: DictionaryManage },
    { path: '/school/school-manage', component: SchoolManage }
  ]
})
