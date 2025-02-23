import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native';
import { AntDesign, FontAwesome6, Fontisto } from '@expo/vector-icons';
import SortIcon from '../ui/SortIcon';
import { debounce } from 'lodash';
import Modal from 'react-native-modal';

// Types that would match your API response
interface Facility {
    ccn: string;
    facilityName: string;
    address: string;
    city: string;
    state: string;
    premium: number;
    riskScore: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// Add this type for sort state
type SortState = {
    field: 'facilityName' | 'address' | 'premium' | 'riskLevel' | null;
    direction: 'asc' | 'desc' | null;
};

// Define MOCK_PAGINATION
const MOCK_PAGINATION: PaginationInfo = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
};

// Add new interface for available facilities
interface AvailableFacility {
    ccn: string;
    facilityName: string;
    address: string;
    city: string;
    state: string;
    premium: number;
    riskScore: string;
}

const Portfolio = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [facilities, setFacilities] = React.useState<Facility[]>([]);
    const [pagination, setPagination] = React.useState<PaginationInfo>(MOCK_PAGINATION);
    const [sortState, setSortState] = React.useState<SortState>({
        field: null,
        direction: null
    });
    const [loading, setLoading] = React.useState(false);
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [availableFacilities, setAvailableFacilities] = React.useState<AvailableFacility[]>([]);
    const [addingFacility, setAddingFacility] = React.useState(false);

    const getRiskLevelStyle = (level: Facility['riskScore']) => {
        switch (level.toLowerCase()) {
            case 'low':
                return 'bg-[#ECFDF3] text-[#027A48] border-[#027A48]';
            case 'medium':
                return 'bg-[#FFFAEB] text-[#B54708] border-[#B54708]';
            case 'high':
                return 'bg-[#FEF3F2] text-[#B42318] border-[#B42318]';
            default:
                return '';
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        try {
            setLoading(true);
            const response = await fetch(`https://sca-api-535434239234.us-central1.run.app/portfolios/facilities/search?search_term=${query}&limit=10&offset=0`);
            const data = await response.json();
            
            const transformedData = data.map((facility: any) => ({
                ccn: facility.ccn,
                facilityName: facility.facility_name,
                address: facility.address,
                city: facility.city,
                state: facility.state,
                premium: facility.premium || 0,
                riskScore: facility.risk_score
            }));
            
            setFacilities(transformedData);
        } catch (error) {
            console.error('Error searching facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce the search to avoid too many API calls
    const debouncedSearch = React.useCallback(
        debounce((query: string) => handleSearch(query), 300),
        []
    );

    const handleSearchInput = (query: string) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            debouncedSearch(query);
        }
    };

    const handleRemoveFacility = async (ccn: string) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://sca-api-535434239234.us-central1.run.app/portfolios/facilities/${ccn}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                // Remove facility from local state if API call successful
                setFacilities(facilities.filter(facility => facility.ccn !== ccn));
            } else {
                console.error('Error removing facility');
            }
        } catch (error) {
            console.error('Error removing facility:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        // In the future, this will trigger an API call
        setPagination({ ...pagination, currentPage: page });
    };

    const formatAddress = (facility: Facility) => {
        return `${facility.address} ${facility.city}, ${facility.state}`;
    };

    const handleSort = (field: SortState['field']) => {
        setSortState(prevState => {
            let direction: SortState['direction'];
            
            if (prevState.field !== field) {
                direction = 'asc';
            } else {
                direction = prevState.direction === 'asc' ? 'desc' : 'asc';
            }
            
            return { field, direction };
        });
        // Later you'll add API call here
    };

    // Fetch added facilities (for main screen)
    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://sca-api-535434239234.us-central1.run.app/portfolios/facilities');
            const data = await response.json();
            
            const transformedData = data.map((facility: any) => ({
                ccn: facility.ccn,
                facilityName: facility.facility_name,
                address: facility.address,
                city: facility.city,
                state: facility.state,
                premium: facility.premium || 0,
                riskScore: facility.risk_score
            }));
            
            setFacilities(transformedData);
        } catch (error) {
            console.error('Error fetching facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available facilities (for modal)
    const fetchAvailableFacilities = async () => {
        try {
            const response = await fetch('https://sca-api-535434239234.us-central1.run.app/portfolios/facilities/search?search_term=&limit=100&offset=0');
            const data = await response.json();
            
            const transformedData = data.map((facility: any) => ({
                ccn: facility.ccn,
                facilityName: facility.facility_name,
                address: facility.address,
                city: facility.city,
                state: facility.state,
                premium: facility.premium || 0,
                riskScore: facility.risk_score
            }));
            
            setAvailableFacilities(transformedData);
        } catch (error) {
            console.error('Error fetching available facilities:', error);
        }
    };

    const handleAddFacility = async (ccn: string) => {
        try {
            setAddingFacility(true);
            const response = await fetch(
                `https://sca-api-535434239234.us-central1.run.app/portfolios/facilities/${ccn}`,
                {
                    method: 'POST',
                }
            );

            if (response.ok) {
                // Refresh both lists
                await fetchFacilities();
                await fetchAvailableFacilities();
            }
        } catch (error) {
            console.error('Error adding facility:', error);
        } finally {
            setAddingFacility(false);
        }
    };

    // Fetch added facilities on component mount
    React.useEffect(() => {
        fetchFacilities();
    }, []);

    // Update modal open handler
    const handleOpenModal = () => {
        setModalVisible(true);
        fetchAvailableFacilities();
    };

    return (
        <View className="px-16 py-10 h-full">
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-[32px] font-extralight text-dark-blue">Portfolio</Text>
                
                <View className="flex-row items-center flex-1 max-w-[450px] ml-8">
                    <View className="flex-row items-center bg-white rounded-lg px-3 py-2 flex-1 mr-4 border border-gray-300">
                        <AntDesign name="search1" size={22} color="#C5C5C5" />
                        <TextInput
                            placeholder="Search for facility"
                            className="ml-2 flex-1 h-6 text-[14px] text-gray-900"
                            value={searchQuery}
                            onChangeText={handleSearchInput}
                            style={[Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                            placeholderTextColor="#667085"
                        />
                    </View>
                    <TouchableOpacity 
                        className="bg-dark-blue px-6 py-3.5 gap-1 rounded-full flex-row items-center"
                        onPress={handleOpenModal}
                    >
                        <Text className="text-white text-[14px] font-medium">Add facilities</Text>
                        <FontAwesome6 name="angle-right" size={13} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="bg-white rounded-3xl shadow-sm py-1 overflow-hidden flex-1 flex flex-col">
                <View className="flex-row border-b border-gray-200 px-6 p-4">
                    <TouchableOpacity 
                        className="flex-1 flex-row items-center"
                        onPress={() => handleSort('facilityName')}
                    >
                        <Text className="text-[14px] font-light text-dark-blue">Facility name</Text>
                        <SortIcon 
                            isSelected={sortState.field === 'facilityName'}
                            activeColor="#C5C5C5"
                            inactiveColor="#C5C5C5"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-1 flex-row items-center"
                        onPress={() => handleSort('address')}
                    >
                        <Text className="text-[14px] font-light text-dark-blue">Address</Text>
                        <SortIcon 
                            isSelected={sortState.field === 'address'}
                            activeColor="#C5C5C5"
                            inactiveColor="#C5C5C5"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-1 flex-row items-center"
                        onPress={() => handleSort('premium')}
                    >
                        <Text className="text-[14px] font-light text-dark-blue">Premium</Text>
                        <SortIcon 
                            isSelected={sortState.field === 'premium'}
                            activeColor="#C5C5C5"
                            inactiveColor="#C5C5C5"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-1 flex-row items-center"
                        onPress={() => handleSort('riskLevel')}
                    >
                        <Text className="text-[14px] font-light text-dark-blue">Risk Level</Text>
                        <SortIcon 
                            isSelected={sortState.field === 'riskLevel'}
                            activeColor="#C5C5C5"
                            inactiveColor="#C5C5C5"
                        />
                    </TouchableOpacity>

                    <View className="w-24" />
                </View>

                <ScrollView 
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View className="p-4 px-6">
                            <Text>Loading...</Text>
                        </View>
                    ) : facilities.map((facility) => (
                        <View 
                            key={facility.ccn} 
                            className="flex-row items-center p-4 px-6 py-5 border-b border-gray-100"
                        >
                            <View className="flex-1">
                                <Text className="text-[14px] font-semibold text-gray-900">{facility.facilityName}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-gray-600 max-w-[150px]">{formatAddress(facility)}</Text>
                            </View>
                            <View className="flex-1 flex-row items-center">
                                <View className="flex-row items-center border border-gray-200 rounded-xl py-3.5 pl-4 bg-white w-[130px]">
                                    <View className="flex-row items-center">
                                        <Fontisto name="dollar" size={13} className='text-emerald-600' />
                                        <Text className="text-[14px] text-gray-900 ml-1">
                                            {facility.premium.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className={`px-6 py-3.5 rounded-full border w-fit ${getRiskLevelStyle(facility.riskScore)}`}>
                                    {facility.riskScore}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                className="w-24 border border-gray-200 items-center justify-center rounded-full py-3.5 px-4 hover:bg-red-600 hover:border-red-600 group transition-all duration-300 ease-in-out"
                                onPress={() => handleRemoveFacility(facility.ccn)}
                            >
                                <Text className="text-[14px] text-gray-500 group-hover:text-white transition-colors duration-300 ease-in-out">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {facilities.length > 10 && (
                <View className="flex-row items-center justify-between mt-6 px-4">
                    <TouchableOpacity 
                        className="flex-row items-center gap-2"
                        onPress={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                    >
                        <FontAwesome6 name="angle-left" size={13} className='text-gray-600' />
                        <Text className="text-[14px] font-light text-gray-600">Previous</Text>
                    </TouchableOpacity>

                    <View className="flex-row gap-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === pagination.totalPages || 
                                (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1))
                            .map((page, index, array) => {
                                if (index > 0 && array[index - 1] !== page - 1) {
                                    return [
                                        <Text key={`ellipsis-${page}`} className="text-[14px] mt-2 text-gray-600 px-2">...</Text>,
                                        <TouchableOpacity 
                                            key={page}
                                            className={`w-10 h-10 items-center justify-center rounded-lg ${
                                                pagination.currentPage === page ? 'bg-dark-blue' : ''
                                            }`}
                                            onPress={() => handlePageChange(page)}
                                        >
                                            <Text className={`text-[14px] mb-2 ${
                                                pagination.currentPage === page ? 'text-white' : 'text-gray-600'
                                            }`}>{page}</Text>
                                        </TouchableOpacity>
                                    ];
                                }
                                return (
                                    <TouchableOpacity 
                                        key={page}
                                        className={`w-8 h-8 items-center justify-center rounded-full ${
                                            pagination.currentPage === page ? 'bg-dark-blue' : ''
                                        }`}
                                        onPress={() => handlePageChange(page)}
                                    >
                                        <Text className={`text-[14px] font-light ${
                                            pagination.currentPage === page ? 'text-white' : 'text-gray-600'
                                        }`}>{page}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>

                    <TouchableOpacity 
                        className="flex-row items-center gap-1"
                        onPress={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                    >
                        <Text className="text-[14px] font-light text-gray-600">Next</Text>
                        <FontAwesome6 name="angle-right" size={13} className='text-gray-600' />
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setModalVisible(false)}
                className="m-0"
            >
                <View className="bg-white rounded-3xl p-6 mx-auto w-[600px]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-light text-dark-blue">Add Facilities</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <AntDesign name="close" size={24} color="#667085" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-[32px] font-extralight text-dark-blue">Portfolio</Text>
                        
                        <View className="flex-row items-center flex-1 max-w-[450px] ml-8">
                            <View className="flex-row items-center bg-white rounded-lg px-3 py-2 flex-1 mr-4 border border-gray-300">
                                <AntDesign name="search1" size={22} color="#C5C5C5" />
                                <TextInput
                                    placeholder="Search for facility"
                                    className="ml-2 flex-1 h-6 text-[14px] text-gray-900"
                                    value={searchQuery}
                                    onChangeText={handleSearchInput}
                                    style={[Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                                    placeholderTextColor="#667085"
                                />
                            </View>
                            <TouchableOpacity 
                                className="bg-dark-blue px-6 py-3.5 gap-1 rounded-full flex-row items-center"
                                onPress={handleOpenModal}
                            >
                                <Text className="text-white text-[14px] font-medium">Add facilities</Text>
                                <FontAwesome6 name="angle-right" size={13} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView className="max-h-[400px]">
                        {availableFacilities.map((facility) => (
                            <View 
                                key={facility.ccn}
                                className="flex-row items-center justify-between p-4 border-b border-gray-100"
                            >
                                <View>
                                    <Text className="text-[14px] font-semibold text-gray-900">
                                        {facility.facilityName}
                                    </Text>
                                    <Text className="text-[14px] text-gray-600">
                                        {`${facility.address} ${facility.city}, ${facility.state}`}
                                    </Text>
                                    <View className="flex-row items-center mt-2">
                                        <View className="flex-row items-center mr-4">
                                            <Fontisto name="dollar" size={13} className='text-emerald-600' />
                                            <Text className="text-[14px] text-gray-900 ml-1">
                                                {facility.premium.toFixed(2)}
                                            </Text>
                                        </View>
                                        <Text className={`px-3 py-1 rounded-full border w-fit ${getRiskLevelStyle(facility.riskScore)}`}>
                                            {facility.riskScore}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    className="bg-dark-blue px-4 py-2 rounded-full"
                                    onPress={() => handleAddFacility(facility.ccn)}
                                    disabled={addingFacility}
                                >
                                    <Text className="text-white text-[14px]">
                                        {addingFacility ? 'Adding...' : 'Add'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

export default Portfolio;
