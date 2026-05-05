import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  FAB,
  Dialog,
  Portal,
  Button,
  TextInput,
  Snackbar,
} from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { api } from '../services/api';
import { BPRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import RecordCard from '../components/RecordCard';

export default function RecordsScreen() {
  const [records, setRecords] = useState<BPRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BPRecord | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { logout } = useAuth();

  const [form, setForm] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    measured_at: new Date().toISOString().slice(0, 16),
    medication: '',
    notes: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getRecords(page, 10);
      setRecords(data.records);
      setTotal(data.total);
    } catch (e: any) {
      if (e.response?.status === 401) {
        logout();
      } else {
        setSnackbarMessage('获取数据失败');
        setSnackbarVisible(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const openAddDialog = () => {
    setEditingRecord(null);
    setForm({
      systolic: '',
      diastolic: '',
      pulse: '',
      measured_at: new Date().toISOString().slice(0, 16),
      medication: '',
      notes: '',
    });
    setDialogVisible(true);
  };

  const openEditDialog = (record: BPRecord) => {
    setEditingRecord(record);
    setForm({
      systolic: record.systolic.toString(),
      diastolic: record.diastolic.toString(),
      pulse: record.pulse.toString(),
      measured_at: new Date(record.measured_at).toISOString().slice(0, 16),
      medication: record.medication || '',
      notes: record.notes || '',
    });
    setDialogVisible(true);
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogVisible(true);
  };

  const handleSubmit = async () => {
    const systolic = parseInt(form.systolic);
    const diastolic = parseInt(form.diastolic);
    const pulse = parseInt(form.pulse);

    if (!systolic || !diastolic || !pulse) {
      setSnackbarMessage('请填写血压和脉搏');
      setSnackbarVisible(true);
      return;
    }

    try {
      const data = {
        systolic,
        diastolic,
        pulse,
        measured_at: new Date(form.measured_at).toISOString(),
        medication: form.medication,
        notes: form.notes,
      };

      if (editingRecord) {
        await api.updateRecord(editingRecord.id, data);
        setSnackbarMessage('更新成功');
      } else {
        await api.createRecord(data);
        setSnackbarMessage('添加成功');
      }
      setDialogVisible(false);
      fetchRecords();
    } catch (e: any) {
      setSnackbarMessage(e.response?.data?.error || '操作失败');
      setSnackbarVisible(true);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteRecord(deletingId);
      setSnackbarMessage('删除成功');
      setSnackbarVisible(true);
      setDeleteDialogVisible(false);
      fetchRecords();
    } catch (e) {
      setSnackbarMessage('删除失败');
      setSnackbarVisible(true);
    }
  };

  const renderItem = ({ item }: { item: BPRecord }) => (
    <RecordCard
      item={item}
      onEdit={openEditDialog}
      onDelete={openDeleteDialog}
    />
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.empty}>
            暂无记录，点击下方按钮添加
          </Text>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddDialog}
        color="white"
      />

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>
            {editingRecord ? '编辑记录' : '添加记录'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="高压(收缩压) mmHg"
              value={form.systolic}
              onChangeText={(text) => setForm({ ...form, systolic: text })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label="低压(舒张压) mmHg"
              value={form.diastolic}
              onChangeText={(text) => setForm({ ...form, diastolic: text })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label="脉搏(次/分钟)"
              value={form.pulse}
              onChangeText={(text) => setForm({ ...form, pulse: text })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label="测量时间"
              value={form.measured_at}
              onChangeText={(text) => setForm({ ...form, measured_at: text })}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="YYYY-MM-DDTHH:mm"
            />
            <TextInput
              label="用药（可选）"
              value={form.medication}
              onChangeText={(text) => setForm({ ...form, medication: text })}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="备注（可选）"
              value={form.notes}
              onChangeText={(text) => setForm({ ...form, notes: text })}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button onPress={handleSubmit}>保存</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除这条记录吗？此操作不可撤销。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>取消</Button>
            <Button onPress={handleDelete} textColor="#f44336">删除</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4caf50',
    borderRadius: 32,
  },
  dialogInput: {
    marginBottom: 12,
  },
  dialog: {
    borderRadius: 4,
  },
});