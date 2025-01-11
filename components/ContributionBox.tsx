import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import figmaService from '../app/api/figma';

interface Contribution {
  date: string;
  intensity: number;
}

interface Stats {
  currentStreak: number;
  recordStreak: number;
  monthlyContributions: number;
  totalContributions: number;
}

const ContributionBox = ({ intensity = 0, date }: { intensity: number; date: string }) => {
  const getColor = () => {
    switch (intensity) {
      case 0:
        return '#261C2C';
      case 1:
        return '#3E2C41';
      case 2:
        return '#5C527F';
      case 3:
        return '#6E85B2';
      case 4:
        return '#9EA3C2';
      default:
        return '#261C2C';
    }
  };

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: getColor(),
          borderWidth: 0.5,
          borderColor: '#3E2C41',
        },
      ]}
    />
  );
};

const StatCard = ({ label, value, subtitle }: { label: string; value: number; subtitle?: string }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const FigmaContributionWidget = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    recordStreak: 0,
    monthlyContributions: 0,
    totalContributions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    loadContributions();
  }, []);

  const calculateStats = (contributionMap: Map<string, number>) => {
    let currentStreak = 0;
    let recordStreak = 0;
    let tempStreak = 0;
    let monthlyCount = 0;
    let totalCount = 0;

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    [...contributionMap.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .forEach(([dateStr, count]) => {
        const date = new Date(dateStr);
        
        totalCount += count;
        
        if (date >= thirtyDaysAgo) {
          monthlyCount += count;
        }
        
        if (count > 0) {
          tempStreak++;
          recordStreak = Math.max(recordStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      });

    currentStreak = tempStreak;

    return {
      currentStreak,
      recordStreak,
      monthlyContributions: monthlyCount,
      totalContributions: totalCount,
    };
  };

  const loadContributions = async () => {
    try {
      const files = await figmaService.getUserFiles();
      const contributionMap = new Map<string, number>();
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      // Initialize with sample data for demonstration
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        contributionMap.set(dateStr, Math.floor(Math.random() * 5));
      }

      if (files && files.length > 0) {
        files.forEach(file => {
          const date = new Date(file.lastModified).toISOString().split('T')[0];
          if (contributionMap.has(date)) {
            contributionMap.set(date, (contributionMap.get(date) || 0) + 1);
          }
        });
      }

      const calculatedStats = calculateStats(contributionMap);
      setStats(calculatedStats);

      const contributionLevels: Contribution[] = Array.from(contributionMap.entries())
        .map(([date, count]) => ({
          date,
          intensity: Math.min(Math.ceil(count), 4),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setContributions(contributionLevels);
    } catch (error) {
      console.error('Error loading contributions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.widget}>
        <Text style={styles.title}>Your FigWig Recap</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading contributions...</Text>
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <View style={styles.gridContainer}>
              {contributions.length > 0 ? (
                <View style={styles.grid}>
                  {contributions.map((contribution) => (
                    <ContributionBox
                      key={contribution.date}
                      intensity={contribution.intensity}
                      date={contribution.date}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.noData}>No contribution data available</Text>
              )}
            </View>

            <View style={styles.statsSection}>
              <View style={styles.streakSection}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Streak</Text>
                <Text style={styles.sectionSubtitle}>(in days)</Text>
                <View style={styles.streakCards}>
                  <StatCard label="Current" value={stats.currentStreak} />
                  <StatCard label="Record" value={stats.recordStreak} />
                </View>
              </View>

              <View style={styles.contributionsSection}>
                <MaterialCommunityIcons name="content-save" size={24} color="#4ECDC4" />
                <Text style={styles.sectionTitle}>Contributions</Text>
                <Text style={styles.sectionSubtitle}>(auto-saves)</Text>
                <View style={styles.contributionCards}>
                  <StatCard label="This Month" value={stats.monthlyContributions} />
                  <StatCard label="All Time" value={stats.totalContributions} />
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1A1625',
    overflow: 'hidden',
  },
  widget: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  gridContainer: {
    minHeight: 100,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  box: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  statsSection: {
    gap: 24,
  },
  streakSection: {
    marginBottom: 24,
  },
  contributionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9EA3C2',
    marginBottom: 16,
  },
  streakCards: {
    flexDirection: 'row',
    gap: 16,
  },
  contributionCards: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#261C2C',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 16,
    color: '#9EA3C2',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6E85B2',
    marginTop: 2,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#FF6B6B',
    textAlign: 'center',
    padding: 16,
  },
  noData: {
    textAlign: 'center',
    padding: 16,
    color: '#9EA3C2',
  },
});

export default FigmaContributionWidget;