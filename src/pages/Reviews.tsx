import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Star, Flag, Eye } from 'lucide-react';
import { API_URL } from '../config/api';

const tabs = ['All Reviews', 'Patient → Nurse/Caregiver', 'Nurse/Caregiver → Patient'];

interface ReviewData {
  _id: string;
  reviewer: {
    id: string;
    name: string;
    type: string;
  };
  reviewee: {
    id: string;
    name: string;
    type: string;
  };
  rating: number;
  reviewText: string;
  categories: any;
  bookingId: string;
  bookingStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function Reviews() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [activeTab, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (activeTab === 'Patient → Nurse/Caregiver') {
      filtered = filtered.filter(review => 
        review.reviewer.type === 'patient' && 
        (review.reviewee.type === 'nurse' || review.reviewee.type === 'caregiver' || review.reviewee.type === 'caretaker')
      );
    } else if (activeTab === 'Nurse/Caregiver → Patient') {
      filtered = filtered.filter(review => 
        (review.reviewer.type === 'nurse' || review.reviewer.type === 'caregiver' || review.reviewer.type === 'caretaker') &&
        review.reviewee.type === 'patient'
      );
    }

    setFilteredReviews(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchReviews}
          className="mt-2 text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews & Feedback</h1>
        <p className="text-gray-500 mt-1">Moderate reviews and feedback from users ({reviews.length} total)</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === tab ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
            )}
          </button>
        ))}
      </div>

      <Card>
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reviews found</p>
              <p className="text-gray-400 text-sm mt-2">
                {activeTab === 'All Reviews' ? 'No reviews have been submitted yet' : 'No reviews in this category'}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review._id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1824b6] to-[#14b8a6] rounded-full flex items-center justify-center text-white font-semibold">
                        {review.reviewer.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.reviewer.name}
                          <span className="text-xs text-gray-500 ml-2 font-normal">({review.reviewer.type})</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          reviewed {review.reviewee.name}
                          <span className="text-xs ml-1">({review.reviewee.type})</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{review.rating}/5</span>
                    </div>
                    {review.reviewText && (
                      <p className="text-gray-700 mt-2">{review.reviewText}</p>
                    )}
                    {!review.reviewText && (
                      <p className="text-gray-400 italic mt-2">No comment provided</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Active
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Details">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg" title="Flag Review">
                      <Flag className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
