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

const currencyCards = {
  USD: {
    name: 'Dólar Americano',
    countryCode: 'US',
  },
  EUR: {
    name: 'Euro',
    countryCode: 'EU',
  },
  MXN: {
    name: 'Peso Mexicano',
    countryCode: 'MX',
  },
};

export default function App() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotes, setQuotes] = useState({ USD: { bid: null, pctChange: null }, EUR: { bid: null, pctChange: null }, MXN: { bid: null, pctChange: null } });
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
      setQuotes({
        USD: {
          bid: data.USD?.bid ? parseFloat(data.USD.bid) : null,
          pctChange: data.USD?.pctChange ? parseFloat(data.USD.pctChange) : null,
        },
        EUR: {
          bid: data.EUR?.bid ? parseFloat(data.EUR.bid) : null,
          pctChange: data.EUR?.pctChange ? parseFloat(data.EUR.pctChange) : null,
        },
        MXN: {
          bid: data.MXN?.bid ? parseFloat(data.MXN.bid) : null,
          pctChange: data.MXN?.pctChange ? parseFloat(data.MXN.pctChange) : null,
        },
      });
      setLastUpdate(new Date());
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as cotações.');
    } finally {
      setLoadingQuotes(false);
    }
  }

  async function handleLogin() {
    if (!email && !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha e-mail e senha.');
      return;
    }
    if (!email) {
      Alert.alert('E-mail Obrigatório', 'Digite seu e-mail para continuar.');
      return;
    }
    if (!password) {
      Alert.alert('Senha Obrigatória', 'Digite sua senha para continuar.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('E-mail Inválido', 'Digite um e-mail válido (ex: usuario@email.com).');
      return;
    }
    setLoadingAuth(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('Login bem-sucedido:', result.user.email);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      Alert.alert('Erro de Login', error.message || 'Falha ao entrar. Verifique os dados e tente novamente.');
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleRegister() {
    if (!email && !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha e-mail e senha.');
      return;
    }
    if (!email) {
      Alert.alert('E-mail Obrigatório', 'Digite seu e-mail para se cadastrar.');
      return;
    }
    if (!password) {
      Alert.alert('Senha Obrigatória', 'Digite uma senha para se cadastrar.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('E-mail Inválido', 'Digite um e-mail válido (ex: usuario@email.com).');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha Fraca', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoadingAuth(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.log('Cadastro bem-sucedido:', result.user.email);
      setEmail('');
      setPassword('');
      Alert.alert('Sucesso', 'Cadastro realizado! Você pode fazer login agora.');
      setMode('login');
    } catch (error) {
      console.error('Erro ao cadastrar:', error.message);
      Alert.alert('Erro de Cadastro', error.message || 'Falha no cadastro. Tente novamente.');
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setQuotes({ USD: { bid: null, pctChange: null }, EUR: { bid: null, pctChange: null }, MXN: { bid: null, pctChange: null } });
    setLastUpdate(null);
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
          </View>
        </View>

        {loadingQuotes ? (
          <ActivityIndicator size="large" color="#4A9B7F" style={styles.loader} />
        ) : (
          Object.keys(currencyCards).map(key => {
            const currency = currencyCards[key];
            const value = quotes[key]?.bid;
            const pctChange = quotes[key]?.pctChange;
            const isPositive = pctChange && pctChange >= 0;
            
            return (
              <View key={key} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: `https://flagsapi.com/${currency.countryCode}/flat/64.png` }}
                    style={styles.flagImage}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardCode}>{key} / BRL</Text>
                    <Text style={styles.cardName}>{currency.name}</Text>
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
    marginVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B263B',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1B263B',
  },
  pctBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    marginTop: 20,
    marginBottom: 12,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#D4A574',
    fontWeight: '700',
  },
  bottomBar: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#E5E8EC',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomTab: {
    color: '#7B8A97',
    fontWeight: '600',
    fontSize: 20,
  },
  bottomTabActive: {
    color: '#4A9B7F',
  },
});
