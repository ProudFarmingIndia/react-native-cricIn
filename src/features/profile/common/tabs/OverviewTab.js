import React from "react";
import { View, StyleSheet } from "react-native";
import SectionCard from "../../../../cards/SectionCard";
import InfoRow from "../../../../cards/InfoRow";
import RankingCard from "../../../../cards/RankingCard";

export default function OverviewTab({ profile = {} }) {
  const safeProfile = profile || {};

  return (
    <View>
      {/* Personal Information */}
      <SectionCard title="Personal Information">
        <InfoRow label="Player Name" value={safeProfile.playerName || ""} />
        <InfoRow
          label="Date of Birth"
          value={
            safeProfile.dob
              ? new Date(safeProfile.dob).toLocaleDateString()
              : "-"
          }
        />
        <InfoRow label="Gender" value={safeProfile.gender || ""} />
        <InfoRow label="City" value={safeProfile.city || ""} />
        <InfoRow label="State" value={safeProfile.state || ""} />
        <InfoRow label="Country" value={safeProfile.country || ""} />
        <InfoRow label="Bio" value={safeProfile.bio || ""} />
      </SectionCard>

      {/* Cricket Information */}
      <SectionCard title="Cricket Information">
        <InfoRow label="Player Type" value={safeProfile.playerType || ""} />
        <InfoRow label="Batting Style" value={safeProfile.battingStyle || ""} />
        <InfoRow label="Bowling Style" value={safeProfile.bowlingStyle || ""} />
        <InfoRow
          label="Jersey Number"
          value={
            safeProfile.jerseyNumber != null
              ? String(safeProfile.jerseyNumber)
              : "-"
          }
        />
      </SectionCard>

      {/* Favourite */}
      <SectionCard title="Favourite">
        <InfoRow label="Favourite Team" value={safeProfile.favoriteTeam || ""} />
        <InfoRow
          label="Favourite Cricketer"
          value={safeProfile.favoriteCricketer || ""}
        />
        <InfoRow label="Favourite Shot" value={safeProfile.favoriteShot || ""} />
        <InfoRow label="Favourite Ball" value={safeProfile.favoriteBall || ""} />
      </SectionCard>

      {/* Rankings */}
      <SectionCard title="Rankings">
        <View style={styles.rankview}>
          <RankingCard
            title="City"
            value={safeProfile?.ranking?.city ?? "-"}
          />
          <RankingCard
            title="State"
            value={safeProfile?.ranking?.state ?? "-"}
          />
          <RankingCard
            title="National"
            value={safeProfile?.ranking?.national ?? "-"}
          />
        </View>
      </SectionCard>

      {/* Achievements */}
      <SectionCard title="Achievements">
        {Array.isArray(safeProfile.achievements) &&
        safeProfile.achievements.length > 0 ? (
          safeProfile.achievements.map((item, index) => (
            <InfoRow
              key={index}
              label={`#${index + 1}`}
              value={item}
            />
          ))
        ) : (
          <InfoRow label="Achievements" value="No achievements added." />
        )}
      </SectionCard>

      {/* Highlights */}
      <SectionCard title="Highlights">
        {Array.isArray(safeProfile.highlights) &&
        safeProfile.highlights.length > 0 ? (
          safeProfile.highlights.map((item, index) => (
            <InfoRow
              key={index}
              label={`#${index + 1}`}
              value={item}
            />
          ))
        ) : (
          <InfoRow label="Highlights" value="No highlights added." />
        )}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  rankview: {
    flexDirection: "row",
    marginTop: 8,
  },
});