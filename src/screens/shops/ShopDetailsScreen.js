// ShopDetailsScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

const thumbnails = [
  'https://images.unsplash.com/photo-1593341646782-e0b495cff86d',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
];

const reviews = [
  {
    id: '1',
    name: 'Arjun J.',
    review:
      'The balance on this bat is incredible. Best investment for the upcoming season.',
  },
  {
    id: '2',
    name: 'Mark S.',
    review:
      'Solid punch! Grain quality is beautiful and it pings like a dream.',
  },
];

const ShopDetailsScreen = () => {
  const [selectedImage, setSelectedImage] = useState(
    thumbnails[0],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* TOP HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>cricIn</Text>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>♡</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>⇪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRODUCT IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.mainImage}
          />

          <View style={styles.bestSellerBadge}>
            <Text style={styles.badgeText}>
              BEST SELLER
            </Text>
          </View>
        </View>

        {/* THUMBNAILS */}
        <FlatList
          horizontal
          data={thumbnails}
          keyExtractor={(item, index) =>
            index.toString()
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedImage(item)}
              style={styles.thumbnailWrapper}
            >
              <Image
                source={{ uri: item }}
                style={styles.thumbnail}
              />
            </TouchableOpacity>
          )}
        />

        {/* PRODUCT DETAILS */}
        <View style={styles.detailsContainer}>
          <Text style={styles.seriesText}>
            Elite Series
          </Text>

          <Text style={styles.productTitle}>
            Pro Grade English Willow
          </Text>

          {/* RATING */}
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>
              ⭐⭐⭐⭐☆
            </Text>

            <Text style={styles.reviewCount}>
              (124 Reviews)
            </Text>
          </View>

          {/* PRICE CARD */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹54,999
              </Text>

              <Text style={styles.oldPrice}>
                ₹69,999
              </Text>

              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  21% OFF
                </Text>
              </View>
            </View>

            <Text style={styles.memberPrice}>
              Member Price: ₹49,999 with cricIn Elite
            </Text>
          </View>

          {/* WEIGHT */}
          <View style={styles.selectionBlock}>
            <Text style={styles.selectionTitle}>
              Weight Category
            </Text>

            <View style={styles.optionRow}>
              <TouchableOpacity
                style={styles.selectedOption}
              >
                <Text style={styles.selectedOptionText}>
                  Standard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>
                  Lightweight
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>
                  Heavy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* HANDLE TYPE */}
          <View style={styles.selectionBlock}>
            <Text style={styles.selectionTitle}>
              Handle Type
            </Text>

            <View style={styles.optionRow}>
              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>
                  Short Handle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selectedOption}
              >
                <Text style={styles.selectedOptionText}>
                  Long Handle
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>
              Crafted for Excellence
            </Text>

            <Text style={styles.description}>
              Forged from the top 1% of English Willow,
              the Elite Grade bat is hand-selected for
              its impeccable grain structure and
              responsiveness.
            </Text>

            <View style={styles.featureRow}>
              <Text style={styles.check}>✔</Text>

              <Text style={styles.featureText}>
                Grade 1 English Willow
              </Text>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.check}>✔</Text>

              <Text style={styles.featureText}>
                Pro-standard oiling & knocking-in
              </Text>
            </View>
          </View>
        </View>

        {/* ADVANTAGE SECTION */}
        <View style={styles.advantageContainer}>
          <Text style={styles.sectionHeading}>
            The cricIn Advantage
          </Text>

          <View style={styles.advantageCard}>
            <Text style={styles.advantageIcon}>
              🏏
            </Text>

            <Text style={styles.advantageTitle}>
              Master Hand-Crafting
            </Text>

            <Text style={styles.advantageDescription}>
              Every blade is hand-crafted for perfect
              balance and power.
            </Text>
          </View>

          <View style={styles.advantageCardGreen}>
            <Text style={styles.advantageIcon}>
              🌱
            </Text>

            <Text style={styles.advantageTitleWhite}>
              Sustainably Sourced
            </Text>

            <Text style={styles.advantageDescriptionWhite}>
              Premium willow from sustainable forests.
            </Text>
          </View>
        </View>

        {/* REVIEWS */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionHeading}>
            Community Feedback
          </Text>

          {reviews.map((item) => (
            <View
              key={item.id}
              style={styles.reviewCard}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>
                  {item.name}
                </Text>

                <Text>⭐⭐⭐⭐⭐</Text>
              </View>

              <Text style={styles.reviewText}>
                "{item.review}"
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartButton}
        >
          <Text style={styles.cartButtonText}>
            Add to Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
        >
          <Text style={styles.buyButtonText}>
            Buy Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ShopDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF1',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00490E',
  },

  headerRight: {
    flexDirection: 'row',
  },

  iconButton: {
    marginLeft: 12,
  },

  icon: {
    fontSize: 24,
    color: '#00490E',
  },

  imageContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },

  mainImage: {
    width: '100%',
    height: 420,
  },

  bestSellerBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#00490E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },

  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  thumbnailWrapper: {
    marginRight: 12,
  },

  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },

  detailsContainer: {
    padding: 16,
  },

  seriesText: {
    color: '#00490E',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  productTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#181D17',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  ratingStars: {
    fontSize: 18,
  },

  reviewCount: {
    marginLeft: 10,
    color: '#707A6C',
  },

  priceCard: {
    backgroundColor: '#EBEFE5',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  price: {
    fontSize: 30,
    fontWeight: '800',
    color: '#181D17',
  },

  oldPrice: {
    marginLeft: 12,
    fontSize: 18,
    textDecorationLine: 'line-through',
    color: '#707A6C',
  },

  discountBadge: {
    marginLeft: 12,
    backgroundColor: '#FF8F04',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  discountText: {
    color: '#fff',
    fontWeight: '700',
  },

  memberPrice: {
    marginTop: 12,
    color: '#00490E',
    fontWeight: '600',
  },

  selectionBlock: {
    marginTop: 24,
  },

  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  option: {
    borderWidth: 1,
    borderColor: '#BFCABA',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    marginRight: 12,
    marginBottom: 12,
  },

  selectedOption: {
    borderWidth: 2,
    borderColor: '#00490E',
    backgroundColor: '#E8F6E5',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    marginRight: 12,
    marginBottom: 12,
  },

  optionText: {
    color: '#181D17',
    fontWeight: '600',
  },

  selectedOptionText: {
    color: '#00490E',
    fontWeight: '700',
  },

  descriptionContainer: {
    marginTop: 30,
  },

  descriptionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },

  description: {
    color: '#40493D',
    lineHeight: 24,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  check: {
    color: '#00490E',
    marginRight: 10,
    fontSize: 18,
  },

  featureText: {
    fontWeight: '600',
  },

  advantageContainer: {
    padding: 16,
  },

  sectionHeading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },

  advantageCard: {
    backgroundColor: '#EBEFE5',
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
  },

  advantageCardGreen: {
    backgroundColor: '#00490E',
    padding: 20,
    borderRadius: 22,
  },

  advantageIcon: {
    fontSize: 36,
    marginBottom: 12,
  },

  advantageTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },

  advantageTitleWhite: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },

  advantageDescription: {
    color: '#40493D',
    lineHeight: 22,
  },

  advantageDescriptionWhite: {
    color: '#D7DBD2',
    lineHeight: 22,
  },

  reviewSection: {
    padding: 16,
  },

  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  reviewName: {
    fontWeight: '700',
    fontSize: 16,
  },

  reviewText: {
    color: '#40493D',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E0E4DA',
  },

  cartButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#00490E',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginRight: 12,
  },

  cartButtonText: {
    color: '#00490E',
    fontWeight: '700',
    fontSize: 16,
  },

  buyButton: {
    flex: 1.4,
    backgroundColor: '#00490E',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  buyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});