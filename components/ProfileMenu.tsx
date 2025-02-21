import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Octicons, AntDesign, MaterialIcons } from '@expo/vector-icons';

interface ProfileMenuItem {
    label: string;
    onPress: () => void;
}

interface ProfileMenuProps {
    profileImage: any; // For the image source
    userName: string;
    userEmail: string;
    menuItems: ProfileMenuItem[];
}

const ProfileMenu = ({ profileImage, userName, userEmail, menuItems }: ProfileMenuProps) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <View className="w-full flex-row justify-end p-4 md:p-4 relative z-10">
            <TouchableOpacity 
                className="w-12 h-5 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-gray-200 items-center justify-center bg-white"
                onPress={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
                <Image 
                    source={profileImage}
                    className="w-10 h-10 md:w-12 md:h-12"
                    resizeMode="contain"
                />
            </TouchableOpacity>

            {isProfileMenuOpen && (
                <View 
                    className="absolute top-20 px-1 py-1 right-4 md:right-6 bg-white rounded-lg w-56 drop-shadow-sm z-20"
                    
                >
                    <View className="flex-row items-center">
                        <Image 
                            source={profileImage}
                            className="w-12 h-12 rounded-full"
                            style={{
                                height: 50,
                                width: 40,
                            }}
                        />
                        <View className="ml-2">
                            <Text className="text-[0.8rem] font-medium text-gray-900">{userName}</Text>
                            <Text className="text-[0.75rem] text-gray-500">{userEmail}</Text>
                        </View>
                    </View>

                    <View className="">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity 
                                key={index}
                                className="flex-row items-center py-2 px-3 rounded-md hover:bg-gray-50"
                                onPress={() => {
                                    setActiveIndex(index);
                                    item.onPress();
                                }}
                            >
                                {index === 0 && (
                                    <Octicons 
                                        name="people" 
                                        size={21} 
                                        color={activeIndex === 0 ? '#0E67C7' : '#878B99'} 
                                    />
                                )}
                                {index === 1 && (
                                    <AntDesign 
                                        name="setting" 
                                        size={21} 
                                        color={activeIndex === 1 ? '#0E67C7' : '#878B99'} 
                                    />
                                )}
                                {index === 2 && (
                                    <MaterialIcons 
                                        name="logout" 
                                        size={21} 
                                        color={activeIndex === 2 ? '#0E67C7' : '#878B99'} 
                                    />
                                )}
                                <Text className="text-[0.75rem] text-text-gray ml-2">
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

export default ProfileMenu;