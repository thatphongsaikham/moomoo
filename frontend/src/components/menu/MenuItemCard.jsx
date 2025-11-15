import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useBilingual } from '@/hook/useBilingual';

/**
 * MenuItemCard - Display individual menu item with bilingual support
 * @param {Object} item - Menu item object
 * @param {Number} quantity - Current quantity in cart
 * @param {Function} onAdd - Callback when add button clicked
 * @param {Function} onRemove - Callback when remove button clicked
 */
const MenuItemCard = ({ item, quantity = 0, onAdd, onRemove }) => {
  const { isThai } = useBilingual();

  // Get display name based on language
  const displayName = isThai ? item.nameThai : item.nameEnglish;
  const displayDescription = isThai ? item.descriptionThai : item.descriptionEnglish;

  // Check if item is available
  const isAvailable = item.availability === 'Available';
  const isFree = item.price === 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        !isAvailable ? 'opacity-60' : 'hover:shadow-lg'
      }`}
    >
      {/* Item Image */}
      {item.imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-200">
          <img
            src={item.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Item Details */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
              item.category === 'Special Menu'
                ? 'bg-red-100 text-red-800'
                : item.category === 'Premium Buffet'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {item.category}
          </span>
        </div>

        {/* Item Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-1">{displayName}</h3>

        {/* Item Description */}
        {displayDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {displayDescription}
          </p>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex flex-col">
            {isFree ? (
              <span className="text-lg font-bold text-green-600">
                {isThai ? 'ฟรี' : 'Free'}
              </span>
            ) : (
              <span className="text-lg font-bold text-red-600">
                ฿{item.price.toFixed(0)}
              </span>
            )}
          </div>

          {/* Add/Remove Controls */}
          {isAvailable ? (
            <div className="flex items-center space-x-2">
              {quantity > 0 && (
                <>
                  <button
                    onClick={onRemove}
                    className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    aria-label="Remove item"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-800">
                    {quantity}
                  </span>
                </>
              )}
              <button
                onClick={onAdd}
                className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                aria-label="Add item"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <span className="text-sm font-semibold text-gray-500">
              {isThai ? 'หมด' : 'Out of Stock'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
