import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import DashboardChat from './DashboardChat';
import DashboardPortfolio from './DashboartPortfolio';
import Sidebar, { ActiveView } from '../Sidebar';
import ProfileMenu from '../ProfileMenu';
import { profileData, menuItems } from '../../data/profileData';
import { DashboardProps } from '../../types/chat';
import DashboardFacility from './DashboardFacility';

const DashboardSkeleton = () => (
    <View className="w-full space-y-6 p-4">
        <LoadingSkeleton height={200} className="rounded-lg" />
        <View className="space-y-4">
            <LoadingSkeleton height={60} className="rounded-lg" />
            <LoadingSkeleton height={60} className="rounded-lg" />
            <LoadingSkeleton height={60} className="rounded-lg" />
        </View>
    </View>
);

const Dashboard = ({ isLoading = false }: Omit<DashboardProps, 'conversations'>) => {
    const [activeView, setActiveView] = useState<ActiveView>('chat');
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [facilityData, setFacilityData] = useState<any>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

    const handleSelectItem = (item: string) => {
        setActiveView(item as ActiveView);
    };

    const handleLoadConversation = async (id: string) => {
        console.log('Loading conversation:', id);
    };

    const handleSelectThread = (threadId: string) => {
        console.log('Selected thread ID:', threadId);
        setSelectedThreadId(threadId);
        setActiveView('chat'); // Ensure the chat view is active
    };

    // Cerrar el menú cuando se toca cualquier parte de la pantalla
    const handlePressOutside = () => {
        if (isProfileMenuOpen) {
            setIsProfileMenuOpen(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <View className="flex-1 flex-row">
                <Sidebar
                    isLoading={isLoading}
                    selectedItem={activeView}
                    onSelectItem={handleSelectItem}
                    loadConversation={handleLoadConversation}
                    currentView={activeView}
                    conversations={[]}
                    activeView={activeView}
                    onChangeView={setActiveView}
                    onSelectThread={handleSelectThread}
                />
                <View className="flex-1 bg-background-gray">
                    <ProfileMenu
                        profileImage={profileData.profileImage}
                        userName={profileData.userName}
                        userEmail={profileData.userEmail}
                        menuItems={menuItems}
                        isOpen={isProfileMenuOpen}
                        onToggle={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    />
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        className="flex-1 px-4 md:px-6 lg:px-8"
                    >
                        {isLoading ? (
                            <Animated.View 
                                entering={FadeIn.duration(300)}
                                exiting={FadeOut.duration(300)}
                            >
                                <DashboardSkeleton />
                            </Animated.View>
                        ) : (
                            <>
                                {activeView === 'chat' && (
                                    <Animated.View 
                                        entering={FadeIn.duration(300)}
                                        exiting={FadeOut.duration(300)}
                                    >
                                        <DashboardChat 
                                            title={'What can we help with?'}
                                            isLoading={isLoading}
                                            error={null}
                                            threadId={selectedThreadId || undefined}
                                        />
                                    </Animated.View>
                                )}
                                {activeView === 'portfolio' && (
                                    <Animated.View 
                                        entering={FadeIn.duration(300)}
                                        exiting={FadeOut.duration(300)}
                                    >
                                        <DashboardPortfolio 
                                            onChangeView={setActiveView}
                                            onSelectFacility={(data) => {
                                                console.log('Dashboard - Received facility data:', data);
                                                setFacilityData(data);
                                                setActiveView('facility');
                                            }}
                                        />
                                    </Animated.View>
                                )}
                                {activeView === 'facility' && (
                                    <Animated.View 
                                        entering={FadeIn.duration(300)}
                                        exiting={FadeOut.duration(300)}
                                    >
                                        <DashboardFacility facilityData={facilityData} />
                                    </Animated.View>
                                )}
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Dashboard;