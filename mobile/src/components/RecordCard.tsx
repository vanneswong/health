import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BPRecord } from '../types';
import { getHealthLevel, getHealthColor, formatDateTime } from '../utils/health';

interface RecordCardProps {
  item: BPRecord;
  onEdit: (record: BPRecord) => void;
  onDelete: (id: number) => void;
}

export default function RecordCard({ item, onEdit, onDelete }: RecordCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const level = getHealthLevel(item.systolic, item.diastolic);
  const color = getHealthColor(level);

  const renderRightActions = () => {
    return (
      <View style={styles.rightActions}>
        <View style={styles.editAction}>
          <MaterialCommunityIcons
            name="pencil"
            size={24}
            color="white"
            onPress={() => {
              swipeableRef.current?.close();
              onEdit(item);
            }}
          />
        </View>
        <View style={styles.deleteAction}>
          <MaterialCommunityIcons
            name="delete"
            size={24}
            color="white"
            onPress={() => {
              swipeableRef.current?.close();
              onDelete(item.id);
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="bodySmall" style={styles.date}>
              {formatDateTime(item.measured_at)}
            </Text>
            <Chip
              mode="flat"
              style={{ backgroundColor: color }}
              textStyle={{ color: 'white', fontSize: 12 }}
            >
              {level}
            </Chip>
          </View>

          <Text variant="titleMedium" style={styles.bpValue}>
            高压{item.systolic}/低压{item.diastolic} mmHg
          </Text>
          <Text variant="bodySmall" style={styles.bpDetail}>
            (收缩压{item.systolic}/舒张压{item.diastolic})
          </Text>

          <Text variant="bodyMedium" style={styles.pulse}>
            脉搏: {item.pulse} 次/分钟
          </Text>

          {item.medication && (
            <Text variant="bodySmall" style={styles.medication}>
              用药: {item.medication}
            </Text>
          )}

          {item.notes && (
            <Text variant="bodySmall" style={styles.notes}>
              备注: {item.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    color: '#666',
  },
  bpValue: {
    marginBottom: 2,
  },
  bpDetail: {
    color: '#999',
    marginBottom: 4,
  },
  pulse: {
    marginTop: 4,
  },
  medication: {
    color: '#666',
    marginTop: 4,
  },
  notes: {
    color: '#666',
    marginTop: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  editAction: {
    backgroundColor: '#1976d2',
    width: 48,
    height: 48,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  deleteAction: {
    backgroundColor: '#f44336',
    width: 48,
    height: 48,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
});