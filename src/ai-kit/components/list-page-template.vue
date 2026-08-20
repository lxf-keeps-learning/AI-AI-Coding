<script setup lang="ts">
/**
 * 列表页模板 —— AI 生成列表页的标准参考
 *
 * 包含：
 * - BaseSearch + useSearch（搜索条件管理）
 * - el-table + useTable（分页、loading、selection）
 * - BaseDialog + useDialog（新增/编辑弹窗）
 * - 操作列：编辑、删除（带确认）
 *
 * AI 规则：
 * 生成任何列表页时，必须参考本模板结构，禁止自行发明模式。
 * 将 XxxRecord、getXxxList、deleteXxx、XxxForm 替换为实际业务名即可。
 *
 * 快速生成示例：
 * "参考 list-page-template.vue，生成用户管理页面，
 *  接口：getUserList / deleteUser，字段：name / phone / status"
 */
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseSearch from '../search/BaseSearch.vue'
import BaseDialog from './BaseDialog.vue'
import { useTable } from '../hooks/useTable'
import { useSearch } from '../hooks/useSearch'
import { useDialog } from '../hooks/useDialog'

// ---- 类型定义 ----
interface XxxRecord {
  id: number
  name: string
  status: number
  createTime: string
}

interface XxxQuery extends Record<string, unknown> {
  name: string
  status: string | number
}

// ---- 模拟 API（替换为真实 service）----
async function getXxxList(_p: unknown) {
  return { list: [] as XxxRecord[], total: 0 }
}
async function deleteXxx(_id: number) {}

// ---- Hooks ----
const { tableData, loading, error, pagination, fetchList, handleSearch, handlePageChange, handleSizeChange,
  handleSelectionChange } = useTable<XxxRecord, XxxQuery>((p) => getXxxList(p))

const { params, searchImmediately, reset } = useSearch<XxxQuery>({ name: '', status: '' }, handleSearch)

const dialog = useDialog<XxxRecord | null>()

// ---- 操作 ----
function handleAdd() {
  void dialog.open(null)
}

function handleEdit(row: XxxRecord) {
  void dialog.open(row)
}

async function handleDelete(row: XxxRecord) {
  await ElMessageBox.confirm(`确认删除「${row.name}」？`, '提示', { type: 'warning' })
  await deleteXxx(row.id)
  ElMessage.success('删除成功')
  await fetchList()
}

async function handleDialogConfirm() {
  // 通常在此调用 formRef.validate() → 提交 API → dialog.confirm()
  dialog.confirm()
  await fetchList()
}

onMounted(() => fetchList())
</script>

<template>
  <div class="page-container">
    <!-- 搜索区 -->
    <BaseSearch @search="searchImmediately" @reset="reset">
      <el-form-item label="名称">
        <el-input v-model="params.name" placeholder="请输入名称" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="params.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </BaseSearch>

    <!-- 操作栏 -->
    <div class="page-toolbar">
      <el-button type="primary" @click="handleAdd">新 增</el-button>
    </div>

    <!-- 表格 -->
    <el-alert v-if="error" title="列表加载失败" type="error" show-icon :closable="false">
      <template #default><el-button link type="primary" @click="fetchList()">重试</el-button></template>
    </el-alert>
    <el-table v-loading="loading" :data="tableData" row-key="id" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      class="page-pagination"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 弹窗 -->
    <BaseDialog
      v-model:visible="dialog.visible.value"
      :title="dialog.payload.value ? '编辑' : '新增'"
      :loading="dialog.loading.value"
      @confirm="handleDialogConfirm"
      @cancel="dialog.close"
    >
      <!-- <XxxForm ref="formRef" :model="form" /> -->
      <p>在此放置表单组件</p>
    </BaseDialog>
  </div>
</template>

<style scoped>
.page-container {
  padding: 16px;
}
.page-toolbar {
  margin-bottom: 12px;
}
.page-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
