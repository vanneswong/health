import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  List,
  Dialog,
  Portal,
  Button,
  TextInput,
  Snackbar,
  Card,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { APP_NAME, APP_VERSION } from '../utils/config';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setSnackbarMessage('请填写所有字段');
      setSnackbarVisible(true);
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setSnackbarMessage('新密码长度至少4位');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setSnackbarMessage('密码修改成功');
      setSnackbarVisible(true);
      setPasswordDialogVisible(false);
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (e: any) {
      setSnackbarMessage(e.response?.data?.error || '修改失败');
      setSnackbarVisible(true);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>用户信息</List.Subheader>
          <List.Item
            title={user?.username || '未知'}
            description="当前登录用户"
            left={() => <List.Icon icon="account" />}
          />
        </List.Section>
      </Card>

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>账户设置</List.Subheader>
          <List.Item
            title="修改密码"
            description="更改登录密码"
            left={() => <List.Icon icon="lock" />}
            onPress={() => setPasswordDialogVisible(true)}
          />
          <List.Item
            title="退出登录"
            description="退出当前账号"
            left={() => <List.Icon icon="logout" />}
            onPress={handleLogout}
          />
        </List.Section>
      </Card>

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>关于</List.Subheader>
          <List.Item
            title="应用名称"
            description={APP_NAME}
            left={() => <List.Icon icon="information" />}
          />
          <List.Item
            title="版本"
            description={APP_VERSION}
            left={() => <List.Icon icon="tag" />}
          />
        </List.Section>
      </Card>

      <Portal>
        <Dialog
          visible={passwordDialogVisible}
          onDismiss={() => setPasswordDialogVisible(false)}
        >
          <Dialog.Title>修改密码</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="旧密码"
              value={passwordForm.oldPassword}
              onChangeText={(text) =>
                setPasswordForm({ ...passwordForm, oldPassword: text })
              }
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="新密码"
              value={passwordForm.newPassword}
              onChangeText={(text) =>
                setPasswordForm({ ...passwordForm, newPassword: text })
              }
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialogVisible(false)}>
              取消
            </Button>
            <Button onPress={handlePasswordChange} loading={loading}>
              保存
            </Button>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  input: {
    marginBottom: 12,
  },
});