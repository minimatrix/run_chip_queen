import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import {
  BuyInVisual,
  CarryoverVisual,
  PlayerOrderVisual,
  PotsVisual,
  StakeMathVisual,
  TwoHandsVisual,
} from '@/components/ui/HowToPlayVisuals';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TabletContent } from '@/components/ui/TabletContent';
import { fonts, theme } from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HowToPlayScreen() {
  const { isWide } = useLayout();
  const router = useRouter();

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={26} color={theme.gold} />
          </AnimatedPressable>
          <Text style={styles.topTitle}>Rules</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TabletContent>
          <ScreenHeader
            title="How to Play"
            subtitle="Run, Chip, Queen - the full guide."
            suit="♣"
          />

          <View style={isWide ? styles.sectionsGrid : undefined}>
          <RuleSection
            title="The basics"
            body="Each round has three pots - Run, Chip, and Queen. Every player who can afford it puts the same stake into each pot. After the hand, pick who won each pot and the app tracks everyone's money automatically."
          >
            <PotsVisual />
          </RuleSection>

          <RuleSection
            title="Stakes & pot values"
            body="When you set up a table you choose a stake per pot per player and a starting balance for everyone. The stake is what each player puts into each individual pot."
          >
            <StakeMathVisual />
            <Text style={styles.footnote}>
              Fewer players in a round means smaller pots. The app recalculates
              automatically when someone is out of funds.
            </Text>
          </RuleSection>

          <RuleSection
            title="Setting up a table"
            body="Give your game a name, set the stake and starting balance, then add players in the order they'll sit around the table. You can reorder players before you start - saved players can be quick-added from your player list."
          />

          <RuleSection
            title="Player order"
            body="Order matters for Two Hands (see below). The first player in the list is in the hot seat for round 1. Use the arrows when creating a game to move players up or down."
          >
            <PlayerOrderVisual />
          </RuleSection>

          <RuleSection
            title="Two Hands"
            body="Each round, one seat in the table order is marked for Two Hands — round 1 is player 1, round 2 is player 2, and so on. If that player is out, the next player in order stands in. When they buy back in, they take their own seat turns again."
          >
            <TwoHandsVisual />
          </RuleSection>

          <RuleSection
            title="Playing a round"
            body="On the Round screen, tap a player chip under Run, Chip, or Queen to record who won that pot. Leave a pot blank if nobody won it - the value carries over to the next round. Add optional notes, then save. The leaderboard shows who's still in and what they have left."
          />

          <RuleSection
            title="Carryover"
            body="If a pot has no winner, its full value rolls into the same pot next round on top of the normal stakes. You'll see a carryover banner and a higher pot value on the Round screen."
          >
            <CarryoverVisual />
          </RuleSection>

          <RuleSection
            title="Running out of funds"
            body="Each round costs stake × 3 (one contribution to each pot). If a player can't afford the next round they're marked Out - but if they've already bought into the current round they can still win pots and recover."
          />

          <RuleSection
            title="Buy-ins & top-ups"
            body="When someone is short for an upcoming round, the app offers a buy-in prompt so they can add funds and keep playing. You can also tap any player on the Totals tab to top them up manually. All buy-ins appear in round history and final standings."
          >
            <BuyInVisual />
          </RuleSection>

          <RuleSection
            title="Leaderboard & finishing"
            body="The Totals tab shows live standings with winnings and what's left in each player's stack. When the table is done, end the game from the More tab to see final standings, round-by-round history, and a shareable summary for settling up."
          />
          </View>

          <GlassPanel style={[styles.tipPanel, isWide && styles.tipPanelWide]}>
            <Text style={styles.tipTitle}>Quick tip</Text>
            <Text style={styles.tipBody}>
              Adjust the default stake increment and starting balance in
              Settings - new games pick up those values automatically.
            </Text>
          </GlassPanel>
          </TabletContent>
        </ScrollView>
      </SafeAreaView>
    </FeltBackground>
  );
}

function RuleSection({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const { isWide } = useLayout();

  return (
    <GlassPanel style={[styles.section, isWide && styles.sectionGrid]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      {children ? <View style={styles.visual}>{children}</View> : null}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.muted,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  section: {
    marginBottom: 14,
    padding: 16,
  },
  sectionGrid: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 320,
    marginBottom: 0,
  },
  sectionTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: theme.text,
    marginBottom: 8,
  },
  sectionBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  visual: {
    marginTop: 16,
    gap: 10,
  },
  footnote: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 4,
  },
  tipPanel: {
    marginTop: 14,
    padding: 16,
    marginBottom: 8,
  },
  tipPanelWide: {
    marginTop: 20,
  },
  tipTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tipBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 21,
  },
});
