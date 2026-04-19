import { View } from 'react-native';
import { Text } from '../../src/components/ui/Text';
import { Screen } from '../../src/components/ui/Screen';

export default function DashboardScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text variant="h3">Dashboard</Text>
        <Text color="muted" className="mt-2">Bienvenido a MagusERP</Text>
      </View>
    </Screen>
  );
}
