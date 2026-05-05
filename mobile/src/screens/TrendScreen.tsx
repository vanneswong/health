import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import {
  Text,
  Card,
  SegmentedButtons,
  Surface,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../services/api';
import { TrendData } from '../types';
import { getHealthColor } from '../utils/health';
import { useAuth } from '../contexts/AuthContext';

// 转换服务端返回的健康等级显示文本
function formatHealthLevel(level: string): string {
  if (level === '正常高值') return '偏高';
  return level;
}

const screenWidth = Dimensions.get('window').width;

export default function TrendScreen() {
  const [data, setData] = useState<TrendData[]>([]);
  const [days, setDays] = useState<string>('30');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const fetchTrend = async () => {
    setLoading(true);
    try {
      const result = await api.getTrend(Number(days));
      setData(result);
    } catch (e: any) {
      if (e.response?.status === 401) {
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrend();
  }, [days]);

  const chartData = {
    labels: data.slice(0, 6).map((item) => item.date.slice(5)),
    datasets: [
      {
        data: data.slice(0, 6).map((item) => item.systolic),
        color: () => '#f44336',
        strokeWidth: 2,
      },
      {
        data: data.slice(0, 6).map((item) => item.diastolic),
        color: () => '#2196f3',
        strokeWidth: 2,
      },
      {
        data: data.slice(0, 6).map((item) => item.pulse),
        color: () => '#4caf50',
        strokeWidth: 2,
      },
    ],
  };

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

      {data.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              暂无数据，请先添加血压记录
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.chartCard}>
          <Card.Content>
            <LineChart
              data={chartData}
              width={screenWidth - 48}
              height={300}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => '#666',
                propsForDots: {
                  r: '4',
                },
              }}
              bezier
              style={styles.chart}
            />

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
                <Text variant="bodySmall">高压(收缩压)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2196f3' }]} />
                <Text variant="bodySmall">低压(舒张压)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4caf50' }]} />
                <Text variant="bodySmall">脉搏</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      <Surface style={styles.referenceCard}>
        <Text variant="titleSmall" style={styles.referenceTitle}>参考标准</Text>
        <View style={styles.referenceRow}>
          <View style={styles.referenceItem}>
            <View style={[styles.referenceDot, { backgroundColor: '#4caf50' }]} />
            <Text variant="bodySmall">正常: 高压&lt;120, 低压&lt;80</Text>
          </View>
          <View style={styles.referenceItem}>
            <View style={[styles.referenceDot, { backgroundColor: '#ff9800' }]} />
            <Text variant="bodySmall">偏高: 120-139/80-89</Text>
          </View>
          <View style={styles.referenceItem}>
            <View style={[styles.referenceDot, { backgroundColor: '#f44336' }]} />
            <Text variant="bodySmall">高血压: ≥140/≥90</Text>
          </View>
        </View>
      </Surface>

      <View style={styles.dataList}>
        <Text variant="titleMedium" style={styles.listTitle}>
          近期记录 ({data.length}条)
        </Text>
        {data.slice(0, 5).map((item) => (
          <Card key={item.id} style={styles.dataCard}>
            <Card.Content>
              <View style={styles.dataRow}>
                <Text variant="bodySmall">{item.date}</Text>
                <Text variant="bodyMedium">
                  {item.systolic}/{item.diastolic} mmHg
                </Text>
                <Text variant="bodySmall">{item.pulse} 次/分</Text>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: getHealthColor(item.healthLevel) },
                  ]}
                >
                  <Text style={styles.levelText}>{formatHealthLevel(item.healthLevel)}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
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
  chartCard: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 4,
  },
  referenceCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 4,
    elevation: 1,
  },
  referenceTitle: {
    marginBottom: 8,
  },
  referenceRow: {
    flexDirection: 'column',
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  referenceDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  dataList: {
    marginTop: 8,
    marginBottom: 32,
  },
  listTitle: {
    marginBottom: 8,
  },
  dataCard: {
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
  },
});