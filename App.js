import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const currencyInfo = {
  USD: { name: 'Dólar Americano', countryCode: 'US' },
  EUR: { name: 'Euro', countryCode: 'FR' },
  GBP: { name: 'Libra Esterlina', countryCode: 'GB' },
  JPY: { name: 'Iene Japonês', countryCode: 'JP' },
  AUD: { name: 'Dólar Australiano', countryCode: 'AU' },
  CAD: { name: 'Dólar Canadense', countryCode: 'CA' },
  CHF: { name: 'Franco Suíço', countryCode: 'CH' },
  CNY: { name: 'Iuane Chinês', countryCode: 'CN' },
  INR: { name: 'Rupia Indiana', countryCode: 'IN' },
  MXN: { name: 'Peso Mexicano', countryCode: 'MX' },
  SGD: { name: 'Dólar de Singapura', countryCode: 'SG' },
  HKD: { name: 'Dólar de Hong Kong', countryCode: 'HK' },
  NZD: { name: 'Dólar Neozelandês', countryCode: 'NZ' },
  SEK: { name: 'Coroa Sueca', countryCode: 'SE' },
  NOK: { name: 'Coroa Norueguesa', countryCode: 'NO' },
  DKK: { name: 'Coroa Dinamarquesa', countryCode: 'DK' },
  KRW: { name: 'Won Coreano', countryCode: 'KR' },
  TRY: { name: 'Lira Turca', countryCode: 'TR' },
  RUB: { name: 'Rublo Russo', countryCode: 'RU' },
  ZAR: { name: 'Rand Sul-Africano', countryCode: 'ZA' },
  BRL: { name: 'Real Brasileiro', countryCode: 'BR' },
};

export default function App() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotes, setQuotes] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

  async function fetchQuotes() {
    setLoadingQuotes(true);
    try {
      const response = await fetch('https://economia.awesomeapi.com.br/json/all');
      const data = await response.json();
      
      const newQuotes = {};
      
      // Buscar TODAS as moedas da API
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value.bid) {
          newQuotes[key] = {
            bid: parseFloat(value.bid),
            pctChange: value.pctChange ? parseFloat(value.pctChange) : null,
            name: value.name,
          };
        }
      }
      
      setQuotes(newQuotes);
      setLastUpdate(new Date());
      console.log('Cotações carregadas:', Object.keys(newQuotes).length, 'moedas');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as cotações.');
      console.error('Erro ao buscar:', error);
    } finally {
      setLoadingQuotes(false);
    }
  }

  function handleLogin() {
    console.log('Iniciando login com:', email);
    
    if (!email && !password) {
      Alert.alert('Campos Vazios', '⚠️ E-mail e Senha são obrigatórios!\n\nPor favor, preencha ambos os campos.');
      return;
    }
    if (!email) {
      Alert.alert('E-mail Obrigatório', '⚠️ Você precisa inserir um e-mail para continuar.');
      return;
    }
    if (!password) {
      Alert.alert('Senha Obrigatória', '⚠️ Você precisa inserir uma senha para continuar.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('E-mail Inválido', '⚠️ O e-mail deve conter "@".\nExemplo: usuario@email.com');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha Insuficiente', '⚠️ A senha deve ter no mínimo 6 caracteres.\nAtualmente: ' + password.length + ' caracteres.');
      return;
    }
    
    setLoadingAuth(true);
    console.log('Chamando signInWithEmailAndPassword...');
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Login bem-sucedido:', userCredential.user.email);
        const user = userCredential.user;
        setEmail('');
        setPassword('');
        setLoadingAuth(false);
      })
      .catch((error) => {
        console.error('Erro ao fazer login:', error.code, error.message);
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert('Erro de Login', errorMessage || 'Falha ao entrar. Verifique os dados e tente novamente.');
        setLoadingAuth(false);
      });
  }

  function handleRegister() {
    console.log('Iniciando cadastro com:', email);
    
    if (!email && !password) {
      Alert.alert('Campos Vazios', '⚠️ E-mail e Senha são obrigatórios!\n\nPor favor, preencha ambos os campos.');
      return;
    }
    if (!email) {
      Alert.alert('E-mail Obrigatório', '⚠️ Você precisa inserir um e-mail para se cadastrar.');
      return;
    }
    if (!password) {
      Alert.alert('Senha Obrigatória', '⚠️ Você precisa inserir uma senha para se cadastrar.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('E-mail Inválido', '⚠️ O e-mail deve conter "@".\nExemplo: usuario@email.com');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha Insuficiente', '⚠️ A senha deve ter no mínimo 6 caracteres.\nAtualmente: ' + password.length + ' caracteres.');
      return;
    }
    
    setLoadingAuth(true);
    console.log('Chamando createUserWithEmailAndPassword...');
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Cadastro bem-sucedido:', userCredential.user.email);
        const user = userCredential.user;
        setEmail('');
        setPassword('');
        Alert.alert('Sucesso', '✓ Cadastro realizado!\n\nVocê pode fazer login agora.');
        setMode('login');
        setLoadingAuth(false);
      })
      .catch((error) => {
        console.error('Erro ao cadastrar:', error.code, error.message);
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert('Erro de Cadastro', errorMessage || 'Falha no cadastro. Tente novamente.');
        setLoadingAuth(false);
      });
  }

  function handleLogout() {
    signOut(auth)
      .then(() => {
        setQuotes({});
        setLastUpdate(null);
      })
      .catch((error) => {
        console.error('Erro ao fazer logout:', error.message);
        Alert.alert('Erro', 'Falha ao sair da conta.');
      });
  }

  function formatDate(date) {
    if (!date) return 'Ainda não atualizado';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Última atualização: ${hours}:${minutes}`;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>
          <TextInput
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loadingAuth}
          >
            {loadingAuth ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={styles.linkButtonText}>
              {mode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  const sortedCurrencies = Object.keys(quotes).sort();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Conversor de Moedas <Text style={styles.titlePro}>Pro</Text>
          </Text>
          <View style={styles.updateSection}>
            <Text style={styles.updateLabel}>Cotação Atual</Text>
            <Text style={styles.updateTime}>{formatDate(lastUpdate)}</Text>
            <Text style={styles.updateLabel}>Total: {Object.keys(quotes).length} moedas</Text>
          </View>
        </View>

        {loadingQuotes ? (
          <ActivityIndicator size="large" color="#4A9B7F" style={styles.loader} />
        ) : Object.keys(quotes).length > 0 ? (
          sortedCurrencies.map(key => {
            const currencyData = currencyInfo[key];
            const value = quotes[key]?.bid;
            const pctChange = quotes[key]?.pctChange;
            const isPositive = pctChange && pctChange >= 0;
            const countryCode = currencyData?.countryCode || key.slice(0, 2).toUpperCase();
            const currencyName = currencyData?.name || quotes[key]?.name || 'Moeda';
            
            return (
              <View key={key} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.flagsContainer}>
                    <Image
                      source={{ uri: `https://flagsapi.com/${countryCode}/flat/64.png` }}
                      style={styles.flagImage}
                      onError={() => console.log('Erro ao carregar bandeira:', countryCode)}
                    />
                    <Text style={styles.arrowText}>→</Text>
                    <Image
                      source={{ uri: 'https://flagsapi.com/BR/flat/64.png' }}
                      style={styles.flagImage}
                      onError={() => console.log('Erro ao carregar bandeira: BR')}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardCode}>{key} / BRL</Text>
                    <Text style={styles.cardName}>{currencyName}</Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardValue}>
                    {value ? `R$ ${value.toFixed(2).replace('.', ',')}` : 'Não disponível'}
                  </Text>
                  {pctChange !== null && (
                    <View style={[styles.pctBadge, isPositive ? styles.pctPositive : styles.pctNegative]}>
                      <Text style={styles.pctText}>
                        {isPositive ? '▲' : '▼'} {Math.abs(pctChange).toFixed(2)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noData}>Clique em "Atualizar" para carregar as cotações.</Text>
        )}

        <TouchableOpacity style={styles.updateButton} onPress={fetchQuotes} disabled={loadingQuotes}>
          <Text style={styles.updateButtonText}>Atualizar Cotações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomTab}>👤</Text>
        <Text style={[styles.bottomTab, styles.bottomTabActive]}>📊</Text>
        <Text style={styles.bottomTab}>⚙️</Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B2845',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  authCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1B263B',
  },
  input: {
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#2E86AB',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontStyle: 'italic',
  },
  titlePro: {
    color: '#D4A574',
    fontWeight: '800',
  },
  updateSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  updateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  updateTime: {
    fontSize: 12,
    color: '#7B8A97',
    marginTop: 4,
  },
  loader: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  flagImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginHorizontal: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B2845',
  },
  cardName: {
    fontSize: 12,
    color: '#7B8A97',
    marginTop: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E86AB',
  },
  pctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pctPositive: {
    backgroundColor: '#D4EDDA',
  },
  pctNegative: {
    backgroundColor: '#F8D7DA',
  },
  pctText: {
    fontSize: 12,
    fontWeight: '700',
  },
  updateButton: {
    backgroundColor: '#4A9B7F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomTab: {
    fontSize: 24,
    opacity: 0.5,
  },
  bottomTabActive: {
    opacity: 1,
  },
  noData: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    marginVertical: 20,
  },
});
