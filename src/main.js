import Vue from 'vue'
import {
  Button,
  Link,
  Dialog,
  Menu,
  Submenu,
  MenuItem,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Form,
  FormItem,
  Input,
  InputNumber,
  Select,
  Option,
  Radio,
  RadioGroup,
  RadioButton,
  DatePicker,
  Table,
  TableColumn,
  Pagination,
  Popover,
  Card,
  Upload,
  Tree,
  Drawer,
  Tag,
  Row,
  Col,
  Loading,
  Message,
  MessageBox
} from 'element-ui'

import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import router from './router'
import store from './store'
import AjaxPlugin from './plugins/ajax'
import BizPlugin from './plugins/biz'
import App from './page/App'
import Login from './page/Login'
import StudentTrainDrawer from './page/train/StudentTrainDrawer'
import 'element-ui/lib/theme-chalk/index.css'
import './scss/element-variables.scss'

require('es6-promise').polyfill()

Vue.component(Button.name, Button)
Vue.component(Link.name, Link)
Vue.component(Dialog.name, Dialog)
Vue.component(Menu.name, Menu)
Vue.component(Submenu.name, Submenu)
Vue.component(MenuItem.name, MenuItem)
Vue.component(Dropdown.name, Dropdown)
Vue.component(DropdownMenu.name, DropdownMenu)
Vue.component(DropdownItem.name, DropdownItem)
Vue.component(Form.name, Form)
Vue.component(FormItem.name, FormItem)
Vue.component(Input.name, Input)
Vue.component(InputNumber.name, InputNumber)
Vue.component(Select.name, Select)
Vue.component(Option.name, Option)
Vue.component(Radio.name, Radio)
Vue.component(RadioGroup.name, RadioGroup)
Vue.component(RadioButton.name, RadioButton)
Vue.component(DatePicker.name, DatePicker)
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)
Vue.component(Pagination.name, Pagination)
Vue.component(Popover.name, Popover)
Vue.component(Card.name, Card)
Vue.component(Upload.name, Upload)
Vue.component(Tree.name, Tree)
Vue.component(Drawer.name, Drawer)
Vue.component(Tag.name, Tag)
Vue.component(Row.name, Row)
Vue.component(Col.name, Col)
Vue.use(Loading.directive)
Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = Message
Vue.use(AjaxPlugin)
Vue.use(BizPlugin)
Vue.config.productionTip = false
Vue.component('student-train-drawer', StudentTrainDrawer)

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent, LineChart, BarChart, CanvasRenderer])
Vue.prototype.$echarts = echarts

let adminJSON = sessionStorage.getItem('admin')
if (adminJSON) {
  store.commit('admin', JSON.parse(adminJSON))
  enterApp()
} else {
  enterLogin()
}

function enterApp () {
  new Vue({
    store,
    router,
    render: h => h(App)
  }).$mount('#app')
}

function enterLogin () {
  new Vue({
    store,
    router,
    render: h => h(Login)
  }).$mount('#app')
}
