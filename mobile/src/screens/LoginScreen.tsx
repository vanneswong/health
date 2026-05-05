import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../utils/config';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbarMessage('请输入用户名和密码');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
    } catch (e: any) {
      setSnackbarMessage(e.response?.data?.error || '登录失败');
      setSnackbarVisible(true);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>
              {APP_NAME}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              血压健康管理
            </Text>
          </View>

          <TextInput
            label="用户名"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            label="密码"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            登录
          </Button>

          <Text variant="bodySmall" style={styles.hint}>
            默认账号: admin / admin
          </Text>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 8,
    borderRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#1976d2',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  hint: {
    textAlign: 'center',
    marginTop: 16,
    color: '#999',
  },
});