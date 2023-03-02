import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Audio } from "expo-av";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  ActivityIndicator,
  configureFonts,
  Provider as PaperProvider,
  TextInput,
} from "react-native-paper";
import { Feather } from "@expo/vector-icons";

function Input({
  state,
  setState,
  label,
}: {
  state: any;
  setState: (state: any) => void;
  label: string;
}) {
  return (
    <TextInput
      label={
        <Text
          style={{
            fontFamily: "Inter_500Medium",
          }}
        >
          {label}
        </Text>
      }
      value={state}
      onChangeText={(text) => setState(text)}
      style={{
        height: 70,
        justifyContent: "center",
        fontSize: 16,
        backgroundColor: "rgb(231,229,228)",
        marginVertical: 10,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
      }}
      activeUnderlineColor="rgb(87,83,78)"
      theme={{
        fonts: {
          regular: {
            fontFamily: "Inter_400Regular",
          },
        },
      }}
    />
  );
}

function Main({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);

  function updateDatabase(isbn: string) {
    fetch("http://192.168.1.5:3000/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isbn: isbn,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        navigation.navigate("Edit", {
          _id: responseJson.insertedId,
          fetchBookList,
        });
      });
  }

  async function playSound(data: string) {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/scan.mp3")
    );

    await sound.playAsync();
    setBookList([
      ...bookList,
      {
        isbn: data,
      },
    ]);
    updateDatabase(data);
  }

  function fetchBookList() {
    setBookList([]);
    fetch("http://192.168.1.5:3000/list")
      .then((response) => response.json())
      .then((responseJson) => {
        setBookList(responseJson);
      });
  }

  const [bookList, setBookList] = useState<
    {
      isbn: string;
    }[]
  >([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();

    fetchBookList();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: number;
    data: string;
  }) => {
    console.log(data);
    if (!bookList.some((e) => e.isbn === data) && type === 32) {
      setIsScanning(false);
      playSound(data);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View className="w-full h-screen bg-stone-100 py-6 flex items-center justify-between">
      <ScrollView className="w-full mb-8 px-6">
        {bookList.map((book, index) => (
          <View className="border-b border-stone-300 py-4 block px-2">
            <Text
              className="text-left w-full text-xs text-stone-400"
              key={index}
              style={{
                fontFamily: "Inter_500Medium",
              }}
            >
              {book.isbn}
            </Text>
            <View className="flex flex-row justify-between items-center">
              <Text
                className="text-xl text-stone-600 flex-shrink"
                numberOfLines={2}
                style={{
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {book.title || "Untitled Book"}
              </Text>
              <Pressable
                className="ml-4"
                onPress={() => {
                  navigation.navigate("Edit", {
                    _id: book._id,
                    fetchBookList,
                  });
                }}
              >
                <Feather name="edit-2" size={18} color="rgb(168,162,158)" />
              </Pressable>
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
              }}
              className="text-stone-500 mt-2"
            >
              Author: {book.author}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
              }}
              className="text-stone-500"
            >
              Publisher: {book.publisher}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
              }}
              className="text-stone-500"
            >
              Published: {book.year}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
              }}
              className="text-stone-500"
            >
              Pages: {book.pages}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
              }}
              className="text-stone-500"
            >
              Language: {book.language}
            </Text>
          </View>
        ))}
      </ScrollView>
      {!isScanning ? (
        <View className="px-8 w-full">
          <Pressable
            onPress={() => {
              setIsScanning(true);
            }}
            className="w-full py-6 bg-stone-700 rounded-lg"
          >
            <Text
              style={{
                fontFamily: "Inter_500Medium",
              }}
              className="text-stone-200 uppercase text-center"
            >
              {isScanning ? "scanning" : "scan"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <BarCodeScanner
          onBarCodeScanned={isScanning ? handleBarCodeScanned : undefined}
          className="w-full h-96"
        />
      )}
      <StatusBar />
    </View>
  );
}

const Edit = ({ navigation, route }) => {
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [pages, setPages] = useState("");
  const [language, setLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("http://192.168.1.5:3000/list/" + route.params._id, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        setIsbn(responseJson.isbn);
        setTitle(responseJson.title || "");
        setAuthor(responseJson.author || "");
        setPublisher(responseJson.publisher || "");
        setYear(responseJson.year || "");
        setPages(responseJson.pages || "");
        setLanguage(responseJson.language || "");
      });
  }, []);

  return (
    <View className="w-full h-full p-8 bg-stone-100 flex justify-between flex-col">
      <View>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
          }}
          className="text-base text-stone-600 mb-2"
        >
          ISBN: {isbn}
        </Text>
        <Input label="Title" state={title} setState={setTitle} />
        <Input label="Author" state={author} setState={setAuthor} />
        <Input label="Publisher" state={publisher} setState={setPublisher} />
        <Input label="Year" state={year} setState={setYear} />
        <Input label="Pages" state={pages} setState={setPages} />
        <Input label="Language" state={language} setState={setLanguage} />
      </View>
      <Pressable
        onPress={() => {
          setIsLoading(true);
          fetch("http://192.168.1.5:3000/update/" + route.params._id, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              isbn: isbn,
              title: title,
              author: author,
              publisher: publisher,
              year: year,
              pages: pages,
              language: language,
            }),
          })
            .then((response) => response.json())
            .then((responseJson) => {
              setIsLoading(false);
              route.params.fetchBookList();
              navigation.goBack();
            })
            .catch((error) => {
              setIsLoading(false);
              console.error(error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }}
        className="w-full py-6 bg-stone-700 rounded-lg"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text
            style={{
              fontFamily: "Inter_500Medium",
            }}
            className="text-stone-200 uppercase text-center"
          >
            save
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const Stack = createStackNavigator();

export default function App() {
  const [isFontLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    isFontLoaded && (
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Edit" component={Edit} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    )
  );
}
