import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Project } from '.';

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
}

export const ProjectCard = ({ project, onPress }: ProjectCardProps) => (
  <Card style={styles.card} onPress={() => onPress(project)}>
    <Card.Content>
      <Title>{project.name}</Title>
      <Paragraph>Last modified: {new Date(project.lastModified).toLocaleDateString()}</Paragraph>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
