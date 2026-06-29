import React from "react";
import { View, StyleSheet} from "react-native";
import SectionCard from "../../../../cards/SectionCard";
import InfoRow from "../../../../cards/InfoRow";
import RankingCard from "../../../../cards/RankingCard";

export default function OverviewTab({ profile = {} }) {
  return (
    <View>
      {/* Personal Information */}

      <SectionCard title="Personal Information">
        <InfoRow
          label="Player Name"
          value={profile.playerName}
        />

        <InfoRow
          label="Date of Birth"
          value={
            profile.dob
              ? new Date(profile.dob).toLocaleDateString()
              : "-"
          }
        />

        <InfoRow
          label="Gender"
          value={profile.gender}
        />

        <InfoRow
          label="City"
          value={profile.city}
        />

        <InfoRow
          label="State"
          value={profile.state}
        />

        <InfoRow
          label="Country"
          value={profile.country}
        />

        <InfoRow
          label="Bio"
          value={profile.bio}
        />
      </SectionCard>

      {/* Cricket Information */}

      <SectionCard title="Cricket Information">
        <InfoRow
          label="Player Type"
          value={profile.playerType}
        />

        <InfoRow
          label="Batting Style"
          value={profile.battingStyle}
        />

        <InfoRow
          label="Bowling Style"
          value={profile.bowlingStyle}
        />

        <InfoRow
          label="Jersey Number"
          value={
            profile.jerseyNumber
              ? String(profile.jerseyNumber)
              : "-"
          }
        />
      </SectionCard>

      {/* Favourite */}

      <SectionCard title="Favourite">
        <InfoRow
          label="Favourite Team"
          value={profile.favoriteTeam}
        />

        <InfoRow
          label="Favourite Cricketer"
          value={profile.favoriteCricketer}
        />

        <InfoRow
          label="Favourite Shot"
          value={profile.favoriteShot}
        />

        <InfoRow
          label="Favourite Ball"
          value={profile.favoriteBall}
        />
      </SectionCard>

      {/* Rankings */}

      <SectionCard title="Rankings">
        <View
          style={styles.rankview}
        >
          <RankingCard
            title="City"
            value={profile?.ranking?.city}
          />

          <RankingCard
            title="State"
            value={profile?.ranking?.state}
          />

          <RankingCard
            title="National"
            value={profile?.ranking?.national}
          />
        </View>
      </SectionCard>

      {/* Achievements */}

      <SectionCard title="Achievements">
        {(profile.achievements || []).length > 0 ? (
          profile.achievements.map(
            (item, index) => (
              <InfoRow
                key={index}
                label={`#${index + 1}`}
                value={item}
              />
            )
          )
        ) : (
          <InfoRow
            label="Achievements"
            value="No achievements added."
          />
        )}
      </SectionCard>

      {/* Highlights */}

      <SectionCard title="Highlights">
        {(profile.highlights || []).length > 0 ? (
          profile.highlights.map(
            (item, index) => (
              <InfoRow
                key={index}
                label={`#${index + 1}`}
                value={item}
              />
            )
          )
        ) : (
          <InfoRow
            label="Highlights"
            value="No highlights added."
          />
        )}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  rankview: {
    flexDirection: "row",
    marginTop: 8,
  }
})