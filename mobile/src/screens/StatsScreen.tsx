import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  SegmentedButtons,
  Surface,
} from 'react-native-paper';
import { api } from '../services/api';
import { Summary } from '../types';
import { getHealthColor } from '../utils/health';
import { useAuth } from '../contexts/AuthContext';

// 转换服务端返回的健康等级显示文本
function formatHealthLevel(level: string): string {
  if (level === '正常高值') return '偏高';
  return level;
}

export default function StatsScreen() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [days, setDays] = useState<string>('30');
  const { logout } = useAuth();

  const fetchSummary = async () => {
    try {
      const result = await api.getSummary(Number(days));
      setSummary(result);
    } catch (e: any) {
      if (e.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [days]);

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const healthColor = getHealthColor(summary.healthLevel);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <SegmentedButtons
          value={days}
          onValueChange={(value) => setDays(value)}
          buttons={[
            { value: '7', label: '7天' },
            { value: '30', label: '30天' },
            { value: '90', label: '90天' },
            { value: '365', label: '365天' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {summary.count === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              暂无数据，请先添加血压记录
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Card style={[styles.healthCard, { backgroundColor: healthColor }]}>
            <Card.Content>
              <View style={styles.healthHeader}>
                <Text variant="headlineMedium" style={styles.healthLevel}>
                  {formatHealthLevel(summary.healthLevel)}
                </Text>
                <Text variant="bodySmall" style={styles.healthLabel}>
                  健康状态
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.healthAdvice}>
                {summary.healthAdvice}
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.avgRow}>
            <Surface style={styles.avgCard}>
              <Text variant="titleLarge" style={styles.avgValue}>
                {summary.avgSystolic}
              </Text>
              <Text variant="bodySmall" style={styles.avgLabel}>
                平均高压 mmHg
              </Text>
            </Surface>
            <Surface style={styles.avgCard}>
              <Text variant="titleLarge" style={styles.avgValue}>
                {summary.avgDiastolic}
              </Text>
              <Text variant="bodySmall" style={styles.avgLabel}>
                平均低压 mmHg
              </Text>
            </Surface>
            <Surface style={styles.avgCard}>
              <Text variant="titleLarge" style={[styles.avgValue, { color: '#4caf50' }]}>
                {summary.avgPulse}
              </Text>
              <Text variant="bodySmall" style={styles.avgLabel}>
                平均脉搏
              </Text>
            </Surface>
          </View>

          <Card style={styles.detailCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.detailTitle}>
                高压(收缩压)
              </Text>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>最高值</Text>
                  <Text variant="titleMedium" style={{ color: '#f44336' }}>
                    {summary.maxSystolic}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>最低值</Text>
                  <Text variant="titleMedium" style={{ color: '#4caf50' }}>
                    {summary.minSystolic}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.detailCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.detailTitle}>
                低压(舒张压)
              </Text>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>最高值</Text>
                  <Text variant="titleMedium" style={{ color: '#f44336' }}>
                    {summary.maxDiastolic}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>最低值</Text>
                  <Text variant="titleMedium" style={{ color: '#4caf50' }}>
                    {summary.minDiastolic}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.detailCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.detailTitle}>
                脉搏
              </Text>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>最高值</Text>
                  <Text variant="titleMedium" style={{ color: '#f44336' }}>
                    {summary.maxPulse}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text variant="bodySmall" style={styles.detailLabel}>最低值</Text>
                  <Text variant="titleMedium" style={{ color: '#4caf50' }}>
                    {summary.minPulse}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Surface style={styles.countCard}>
            <Text variant="titleMedium">
              近 {Number(days)} 天共记录 {summary.count} 次
            </Text>
          </Surface>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  segmentedButtons: {
    borderRadius: 4,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  healthCard: {
    marginBottom: 16,
  },
  healthHeader: {
    marginBottom: 8,
  },
  healthLevel: {
    color: 'white',
  },
  healthLabel: {
    color: 'rgba(255,255,255,0.8)',
  },
  healthAdvice: {
    color: 'white',
  },
  avgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avgCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center',
    elevation: 1,
  },
  avgValue: {
    color: '#1976d2',
  },
  avgLabel: {
    color: '#666',
    textAlign: 'center',
  },
  detailCard: {
    marginBottom: 12,
  },
  detailTitle: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
  },
  countCard: {
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    elevation: 1,
    marginBottom: 32,
  },
});